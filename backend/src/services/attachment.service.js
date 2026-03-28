import { randomUUID } from 'crypto';
import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

const ATTACHMENT_BUCKET = process.env.SUPABASE_COMPLAINT_BUCKET || 'complaint-attachments';

const sanitizeFilename = (fileName = 'file') => {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
};

const getPublicUrl = (storagePath) => {
  const { data } = supabaseAdmin.storage.from(ATTACHMENT_BUCKET).getPublicUrl(storagePath);
  return data?.publicUrl || null;
};

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
        logger.warn(`Attachment upload failed for complaint ${complaintId}:`, error.message);
      }
    }

    return persisted;
  },

  getComplaintAttachments: async (complaintId) => {
    const { data, error } = await supabaseAdmin
      .from('complaint_attachments')
      .select('*')
      .eq('complaint_id', complaintId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      logger.warn(`Failed to fetch attachments for complaint ${complaintId}:`, error.message);
      return [];
    }

    return data || [];
  },
};
