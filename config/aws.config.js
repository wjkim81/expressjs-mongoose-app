module.exports = {
  port = process.env.PORT, // App port
  aws_key = "YourAWSKey", // AWS Key
  aws_secret = "YourSuperSecretAWSKey", // AWS Secret
  aws_bucket = "NameOfS3Bucket", // S3 bucket
  //redirect_host = "http://localhost:3000/", // Redirect page after successful upload
  host = "YOUR_S3_PROVIDER", // S3 provider host
  bucket_dir = "uploads/", // Subdirectory in S3 bucket where uploads will go
  max_filesize = 20971520 // Max filesize in bytes (default 20MB)
}