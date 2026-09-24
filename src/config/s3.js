const { S3Client } = require("@aws-sdk/client-s3");

const region = process.env.AWS_REGION || "ap-south-1";

const s3Client = new S3Client({
    region,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const bucketName = process.env.AWS_S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME;

module.exports = {
    s3Client,
    bucketName,
    region
};
