const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");

const { env } = require("../src/config/env");

// Configure multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 16000000 }, // Limit file size to 16MB
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|pdf/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb("Error: Images and PDFs only!");
    }
  },
});
function sanitizeFileName(fileName) {
  const sanitized = String(fileName || "")
    .trim()
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/[^\p{L}\p{N}._-]/gu, "") // Remove special characters except for letters, numbers, dots, underscores, and hyphens
    .replace(/^\.+/, ""); // A leading-dots-only name ("..") would escape the upload dir

  return sanitized || "file";
}

/**
 * Files used to be stored under their original name, so two uploads called
 * "invoice.pdf" overwrote each other and every attachment row pointed at
 * whichever file was written last. The stored name is now unique per upload;
 * the original name is kept separately for display.
 */
function buildStoredFileName(originalName) {
  const safeName = sanitizeFileName(originalName);
  const extension = path.extname(safeName);
  const baseName = path.basename(safeName, extension);
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return `${baseName}-${uniqueSuffix}${extension}`;
}

/** multipart repeats the field per file, so a single description arrives as a string. */
function toDescriptionsArray(descriptions) {
  if (Array.isArray(descriptions)) {
    return descriptions;
  }

  return descriptions ? [descriptions] : [];
}

function fileUploadMiddleware(folderName) {
  return (req, res, next) => {
    upload.array("files")(req, res, async (err) => {
      if (err) {
        return res.status(500).send("Error uploading files.");
      }
      const files = req.files;

      if (files && files.length > 0) {
        try {
          // Define the upload directory
          const uploadDir = path.resolve(env.UPLOADS_DIR, folderName);
          // Ensure the upload directory exists
          await fs.ensureDir(uploadDir);

          const filePaths = [];
          const fileNames = [];

          // Process each file
          for (const file of files) {
            const storedName = buildStoredFileName(file.originalname);

            // Write the file to the specified path
            await fs.writeFile(path.join(uploadDir, storedName), file.buffer);

            // URLs are always posix-style, regardless of the host platform
            filePaths.push(`uploads/${folderName}/${storedName}`);
            fileNames.push(sanitizeFileName(file.originalname));
          }

          // Attach the file paths and descriptions to the request object
          req.filePaths = filePaths;
          req.fileNames = fileNames;
          req.descriptions = toDescriptionsArray(req.body.descriptions);

          next();
        } catch (error) {
          console.error("Error saving files:", error);
          res.status(500).send("Error saving files.");
        }
      } else {
        // Downstream handlers index into these, so never leave them undefined
        req.filePaths = [];
        req.fileNames = [];
        req.descriptions = [];
        next();
      }
    });
  };
}

module.exports = fileUploadMiddleware;
