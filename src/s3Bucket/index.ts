import { S3Client } from "@aws-sdk/client-s3";
import "dotenv/config"

export const s3Client = new S3Client({region: process.env.BUCKET_REGION!,credentials:{accessKeyId:process.env.S3_ACCESS_KEY!,secretAccessKey:process.env.S3_SECRET_KEY!} })