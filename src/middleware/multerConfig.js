const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the upload directory exists
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true }); // Create directory and any necessary subdirectories
  }
};

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use __dirname to locate the src directory, then navigate to public/Images within it
    const uploadDir = path.join(__dirname, "..", "public", "Images"); // Navigate to src/public/Images
    ensureDirExists(uploadDir); // Ensure the folder exists before uploading
    cb(null, uploadDir); // Set the upload destination
  },
  filename: function (req, file, cb) {
    // Generate a unique file name using the current timestamp and original file name
    const uniqueSuffix = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueSuffix); // Set the file name for the uploaded file
  },
});

// File upload middleware with image size and type restrictions
const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  },
});

const   uplaodOne = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  },
});


const addressStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "..", "public", "personalInfo");
    ensureDirExists(uploadDir); // Ensure the folder exists before uploading
    cb(null, uploadDir); // Set the upload destination
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueSuffix); // Set the file name for the uploaded file
  },
});

const addressImage = multer({
  storage: addressStorage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  },
});

// Configure multer to handle three separate image fields
const uploadImages = addressImage.fields([
  { name: 'addressImg', maxCount: 1 },
  { name: 'contentLogo', maxCount: 1 },
  { name: 'contentImage', maxCount: 1 }
]);



// Exporting the upload middleware
module.exports = { upload,uplaodOne,uploadImages };
