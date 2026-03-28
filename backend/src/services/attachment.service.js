import { randomUUID } from 'crypto';
import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

const ATTACHMENT_BUCKET = process.env.SUPABASE_COMPLAINT_BUCKET || 'complaint-attachments';
const HAS_SERVICE_ROLE = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

const sanitizeFilename = (fileName = 'file') => {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
};

const getPublicUrl = (storagePath) => {
  const { data } = supabaseAdmin.storage.from(ATTACHMENT_BUCKET).getPublicUrl(storagePath);
  return data?.publicUrl || null;
};

const isRlsError = (errorLike) => {
  const message = errorLike?.message || String(errorLike || '');
  return message.toLowerCase().includes('row-level security policy');
};

const buildLocalAttachmentRecord = (complaintId, file) => ({
  id: `local-${randomUUID()}`,
  complaint_id: complaintId,
  file_name: file.originalname || 'attachment',
  file_type: file.mimetype || null,
  file_size: file.size || null,
  storage_path: null,
  public_url: null,
  upload_status: 'metadata_only',
});

const uploadFileToStorage = async (complaintId, file) => {
  const safeName = sanitizeFilename(file.originalname || 'attachment');
  const storagePath = `${complaintId}/${Date.now()}-${randomUUID()}-${safeName}`;

  const { error } = await supabaseAdmin.storage
    .from(ATTACHMENT_BUCKET)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype || 'application/octet-stream',
      upsert: false,
    });

  if (error) {
    throw error;
  }

  return {
    storagePath,
    publicUrl: getPublicUrl(storagePath),
  };
};

export const attachmentService = {
  persistAttachments: async (complaintId, uploadedFiles = [], metadataOnlyAttachments = []) => {
    const persisted = [];

    if (!Array.isArray(uploadedFiles) || uploadedFiles.length === 0) {
      if (Array.isArray(metadataOnlyAttachments) && metadataOnlyAttachments.length > 0) {
        logger.warn('Received attachment metadata without file binaries; skipping storage upload.');
      }
      return persisted;
    }

    if (!HAS_SERVICE_ROLE) {
      logger.warn('SUPABASE_SERVICE_ROLE_KEY missing; storing attachments as metadata-only to avoid RLS failures.');
      return uploadedFiles.map((file) => buildLocalAttachmentRecord(complaintId, file));
    }

    for (const file of uploadedFiles) {
      try {
        const { storagePath, publicUrl } = await uploadFileToStorage(complaintId, file);

        const row = {
          complaint_id: complaintId,
          file_name: file.originalname || 'attachment',
          file_type: file.mimetype || null,
          file_size: file.size || null,
          storage_path: storagePath,
          public_url: publicUrl,
        };

        const { data, error } = await supabaseAdmin
          .from('complaint_attachments')
          .insert([row])
          .select()
          .single();

        if (error) {
          throw error;
        }

        persisted.push(data);
      } catch (error) {
        if (isRlsError(error)) {
          logger.warn(`Attachment DB write blocked by RLS for complaint ${complaintId}; using metadata-only fallback.`);
          persisted.push(buildLocalAttachmentRecord(complaintId, file));
        } else {
          logger.warn(`Attachment upload failed for complaint ${complaintId}:`, error.message);
        }
      }
    }

    return persisted;
  },

  getComplaintAttachments: async (complaintId) => {
    let response = await supabaseAdmin
      .from('complaint_attachments')
      .select('*')
      .eq('complaint_id', complaintId)
      .order('uploaded_at', { ascending: false });

    if (response.error && response.error.message?.toLowerCase().includes('uploaded_at') && response.error.message?.toLowerCase().includes('does not exist')) {
      response = await supabaseAdmin
        .from('complaint_attachments')
        .select('*')
        .eq('complaint_id', complaintId);
    }

    const { data, error } = response;

    if (error) {
      logger.warn(`Failed to fetch attachments for complaint ${complaintId}:`, error.message);
      return [];
    }

    return data || [];
  },
};
