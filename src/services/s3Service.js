const aws = require("aws-sdk");
const multer = require("multer");

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-east-1",
});

// Multer → memory (buffer) — no disk write needed
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

/**
 * Upload a file buffer to S3
 * @param {Express.Multer.File} file  - multer file object (has .buffer, .mimetype)
 * @param {string}              key   - S3 object key
 * @returns {Promise<{Location: string}>}  public URL
 */
const uploadToS3 = (file, key) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read",
  };
  return s3.upload(params).promise();
};

/**
 * Delete an object from S3 by its full URL or key
 */
const deleteFromS3 = (keyOrUrl) => {
  let key = keyOrUrl;
  if (keyOrUrl.startsWith("http")) {
    const url = new URL(keyOrUrl);
    key = url.pathname.slice(1); // remove leading "/"
  }
  return s3
    .deleteObject({ Bucket: process.env.AWS_BUCKET_NAME, Key: key })
    .promise();
};

module.exports = { s3, upload, uploadToS3, deleteFromS3 };
