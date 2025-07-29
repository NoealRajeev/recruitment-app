import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { env } from "@/lib/env.server";

export const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function uploadFile(
  file: File,
  projectPrefix: string,
  userId: string
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name);
  // Ensure consistent key format without leading/trailing slashes
  const key = `${projectPrefix}/${userId}/${Date.now()}-${uuidv4()}${ext}`
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");

  await s3.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ACL: "private",
    })
  );

  return key;
}

export async function getFileUrl(key: string): Promise<string> {
  // Clean the key first
  const cleanKey = key.replace(/^\/+/, "").replace(/\/+$/, "");

  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: cleanKey,
    ResponseContentDisposition: "inline",
  });

  // URL expires in 1 hour
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}

export async function deleteFile(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: key,
    })
  );
}

export async function listFiles(prefix: string): Promise<string[]> {
  const response = await s3.send(
    new ListObjectsV2Command({
      Bucket: env.S3_BUCKET_NAME,
      Prefix: prefix,
    })
  );
  return (response.Contents || []).map((obj) => obj.Key!);
}
