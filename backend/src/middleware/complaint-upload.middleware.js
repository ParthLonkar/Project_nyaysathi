import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB per file
    files: 10,
  },
});

export const uploadComplaintAttachments = upload.array('attachments', 10);
