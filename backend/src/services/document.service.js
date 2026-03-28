import { randomUUID } from 'crypto';
import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

const DOCUMENT_BUCKET = process.env.SUPABASE_DOCUMENT_BUCKET || 'complaint-documents';
const HAS_SERVICE_ROLE = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

const sanitizeFilename = (fileName = 'document.txt') => fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

const isRlsError = (errorLike) => {
  const message = errorLike?.message || String(errorLike || '');
  return message.toLowerCase().includes('row-level security policy');
};

const isMissingTableError = (errorLike) => {
  const message = errorLike?.message || String(errorLike || '');
  return message.toLowerCase().includes('complaint_documents')
    && (message.toLowerCase().includes('does not exist') || message.toLowerCase().includes('relation'));
};

const getPublicUrl = (storagePath) => {
  const { data } = supabaseAdmin.storage.from(DOCUMENT_BUCKET).getPublicUrl(storagePath);
  return data?.publicUrl || null;
};

const getSignedUrl = async (storagePath, expiresIn = 60 * 60 * 24) => {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(DOCUMENT_BUCKET)
      .createSignedUrl(storagePath, expiresIn);
    if (error) return null;
    return data?.signedUrl || null;
  } catch (_error) {
    return null;
  }
};

const toBase64Buffer = (value) => {
  if (!value || typeof value !== 'string') return null;
  const cleaned = value.includes('base64,') ? value.split('base64,')[1] : value;
  try {
    return Buffer.from(cleaned, 'base64');
  } catch (_error) {
    return null;
  }
};

const uploadBuffer = async ({ complaintId, fileName, mimeType, contentBuffer }) => {
  const safeName = sanitizeFilename(fileName);
  const storagePath = `${complaintId}/${Date.now()}-${randomUUID()}-${safeName}`;

  const { error } = await supabaseAdmin.storage
    .from(DOCUMENT_BUCKET)
    .upload(storagePath, contentBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) throw error;

  return {
    storagePath,
    publicUrl: getPublicUrl(storagePath),
  };
};

const tryInsertDocumentRow = async (row) => {
  const { data, error } = await supabaseAdmin
    .from('complaint_documents')
    .insert([row])
    .select()
    .single();

  if (error) throw error;
  return data;
};

const buildFallbackDoc = ({ complaintId, documentType, fileName, textContent }) => ({
  id: `local-${randomUUID()}`,
  complaint_id: complaintId,
  document_type: documentType,
  file_name: fileName,
  storage_path: null,
  public_url: null,
  created_at: new Date().toISOString(),
  text_content: textContent || null,
  source: 'memory_fallback',
});

export const documentService = {
  persistGeneratedDocuments: async ({ complaintId, referenceId, aiResult = {}, department }) => {
    const saved = [];
    const queue = [];

    const complaintDraft = String(aiResult?.complaint_draft || '').trim();
    const rtiDraft = String(aiResult?.rti_draft || '').trim();
    const complaintPdf = toBase64Buffer(aiResult?.complaint_pdf);
    const rtiPdf = toBase64Buffer(aiResult?.rti_pdf);

    logger.info(
      `Generated document payload inspection for complaint ${complaintId}`,
      JSON.stringify({
        complaintDraftPresent: Boolean(complaintDraft),
        rtiDraftPresent: Boolean(rtiDraft),
        complaintPdfReceived: Boolean(complaintPdf),
        complaintPdfBytes: complaintPdf?.length || 0,
        rtiPdfReceived: Boolean(rtiPdf),
        rtiPdfBytes: rtiPdf?.length || 0,
      })
    );

    if (complaintDraft) {
      queue.push({
        documentType: 'complaint_draft_text',
        fileName: `Complaint_Letter_${referenceId || complaintId}.txt`,
        mimeType: 'text/plain',
        contentBuffer: Buffer.from(complaintDraft, 'utf-8'),
        textContent: complaintDraft,
      });
    }

    if (rtiDraft) {
      queue.push({
        documentType: 'rti_draft_text',
        fileName: `RTI_Draft_${referenceId || complaintId}.txt`,
        mimeType: 'text/plain',
        contentBuffer: Buffer.from(rtiDraft, 'utf-8'),
        textContent: rtiDraft,
      });
    }

    if (complaintPdf) {
      queue.push({
        documentType: 'complaint_pdf',
        fileName: `Complaint_Letter_${referenceId || complaintId}.pdf`,
        mimeType: 'application/pdf',
        contentBuffer: complaintPdf,
      });
    }

    if (rtiPdf) {
      queue.push({
        documentType: 'rti_pdf',
        fileName: `RTI_Draft_${referenceId || complaintId}.pdf`,
        mimeType: 'application/pdf',
        contentBuffer: rtiPdf,
      });
    }

    if (queue.length === 0) return saved;

    if (!HAS_SERVICE_ROLE) {
      logger.warn('SUPABASE_SERVICE_ROLE_KEY missing; storing generated document metadata in fallback mode.');
      return queue.map((entry) =>
        buildFallbackDoc({
          complaintId,
          documentType: entry.documentType,
          fileName: entry.fileName,
          textContent: entry.textContent,
        })
      );
    }

    for (const entry of queue) {
      try {
        if (entry.documentType === 'complaint_pdf') {
          logger.info(
            `Complaint PDF upload start for complaint ${complaintId}`,
            JSON.stringify({ fileName: entry.fileName, bytes: entry.contentBuffer.length })
          );
        }
        if (entry.documentType === 'rti_pdf') {
          logger.info(
            `RTI PDF upload start for complaint ${complaintId}`,
            JSON.stringify({ fileName: entry.fileName, bytes: entry.contentBuffer.length })
          );
        }

        const uploadResult = await uploadBuffer({
          complaintId,
          fileName: entry.fileName,
          mimeType: entry.mimeType,
          contentBuffer: entry.contentBuffer,
        });

        const row = {
          complaint_id: complaintId,
          document_type: entry.documentType,
          file_name: entry.fileName,
          storage_path: uploadResult.storagePath,
          public_url: uploadResult.publicUrl,
        };

        const savedRow = await tryInsertDocumentRow(row);
        const signedUrl = uploadResult.publicUrl ? null : await getSignedUrl(uploadResult.storagePath);
        const responseRow = {
          ...savedRow,
          public_url: savedRow?.public_url || uploadResult.publicUrl || null,
          signed_url: signedUrl || null,
          download_url: savedRow?.public_url || uploadResult.publicUrl || signedUrl || null,
          view_url: savedRow?.public_url || uploadResult.publicUrl || signedUrl || null,
        };
        saved.push(responseRow);

        if (entry.documentType === 'complaint_pdf') {
          logger.info(
            `Complaint PDF uploaded to storage for complaint ${complaintId}`,
            JSON.stringify({ storagePath: uploadResult.storagePath, hasPublicUrl: Boolean(uploadResult.publicUrl) })
          );
          logger.info(
            `Complaint PDF metadata saved for complaint ${complaintId}`,
            JSON.stringify({ documentId: responseRow?.id || null })
          );
        }
        if (entry.documentType === 'rti_pdf') {
          logger.info(
            `RTI PDF uploaded to storage for complaint ${complaintId}`,
            JSON.stringify({ storagePath: uploadResult.storagePath, hasPublicUrl: Boolean(uploadResult.publicUrl) })
          );
          logger.info(
            `RTI PDF metadata saved for complaint ${complaintId}`,
            JSON.stringify({ documentId: responseRow?.id || null })
          );
        }

        logger.info(
          `Complaint document saved for complaint ${complaintId}`,
          JSON.stringify({
            documentType: entry.documentType,
            fileName: entry.fileName,
            department: department || null,
          })
        );
      } catch (error) {
        if (isRlsError(error) || isMissingTableError(error)) {
          logger.warn(
            `Document persistence fallback for complaint ${complaintId}: ${error.message}`
          );
          saved.push(
            buildFallbackDoc({
              complaintId,
              documentType: entry.documentType,
              fileName: entry.fileName,
              textContent: entry.textContent,
            })
          );
        } else {
          logger.warn(`Document upload failed for complaint ${complaintId}: ${error.message}`);
        }
      }
    }

    return saved;
  },

  getComplaintDocuments: async (complaintId) => {
    let response = await supabaseAdmin
      .from('complaint_documents')
      .select('*')
      .eq('complaint_id', complaintId)
      .order('created_at', { ascending: false });

    if (response.error && isMissingTableError(response.error)) {
      logger.warn('complaint_documents table missing; returning empty document list.');
      return [];
    }

    if (response.error) {
      response = await supabaseAdmin
        .from('complaint_documents')
        .select('*')
        .eq('complaint_id', complaintId);
    }

    const { data, error } = response;
    if (error) {
      logger.warn(`Failed to fetch documents for complaint ${complaintId}: ${error.message}`);
      return [];
    }

    const docs = data || [];
    const enriched = await Promise.all(
      docs.map(async (doc) => {
        const publicUrl = doc.public_url || (doc.storage_path ? getPublicUrl(doc.storage_path) : null);
        const signedUrl = publicUrl ? null : (doc.storage_path ? await getSignedUrl(doc.storage_path) : null);
        return {
          ...doc,
          public_url: publicUrl || null,
          signed_url: signedUrl || null,
          download_url: publicUrl || signedUrl || null,
          view_url: publicUrl || signedUrl || null,
        };
      })
    );
    return enriched;
  },
};
