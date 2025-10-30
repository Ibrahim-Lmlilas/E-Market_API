const multer = require('multer');
const fs = require('fs');
const imageService = require('../services/imageService');

// Create upload directory
const uploadDir = 'uploads/products';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Memory storage for Sharp processing
const storage = multer.memoryStorage();

// File filter - only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file (increased for Sharp processing)
    files: 7, // Maximum 7 files
  },
  fileFilter: fileFilter,
});

// Multiple images upload middleware
const uploadImages = upload.array('images', 7);

// Enhanced middleware with Sharp processing
const uploadImageMiddleware = async (req, res, next) => {
  uploadImages(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 10MB per file',
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum 7 files allowed',
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Upload error: ' + err.message,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    // Process uploaded files with Sharp
    if (req.files && req.files.length > 0) {
      try {
        // Process all images with Sharp
        const processedImages = await imageService.processMultipleImages(
          req.files
        );

        // Format for the controller (compatible with existing model)
        req.body.uploadedImages = processedImages.map((processed, index) => ({
          // Original image data (compatible with existing model)
          url: processed.original.url,
          isMain: index === 0, // First image is main
          filename: processed.original.filename,
          originalName: processed.original.originalName,
          size: processed.original.size,
          mimetype: processed.original.mimetype,

          // Additional Sharp data (stored as extra fields)
          sharpData: {
            sizes: processed,
            urls: imageService.getImageUrls(processed),
          },
        }));

        console.log(`✅ Processed ${req.files.length} images with Sharp`);
      } catch (error) {
        console.error('❌ Sharp processing error:', error);
        return res.status(500).json({
          success: false,
          message: 'Image processing failed: ' + error.message,
        });
      }
    }

    next();
  });
};

module.exports = {
  uploadImageMiddleware,
};
