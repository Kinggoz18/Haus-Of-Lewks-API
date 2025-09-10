import multer from 'multer';
// store file in memory buffer so we can send to DO Spaces
const storage = multer.memoryStorage();

const multerConfig = multer({
  storage,
  limits: { fileSize: 150 * 1024 * 1024 }, // limit 50MB (you mentioned high-quality video uploads)
  fileFilter: (req, file, cb) => {
    // Accept only images and videos
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('video/')
    ) {
      cb(null, true);
    } else {
      cb(
        new Error('Invalid file type, only images and videos allowed!'),
        false
      );
    }
  }
});

export default multerConfig;
