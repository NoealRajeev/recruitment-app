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
  const key = `${projectPrefix}/${userId}/${Date.now()}-${uuidv4()}${ext}`
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");

  console.log("[S3 Upload] File name:", file.name);
  console.log("[S3 Upload] File type:", file.type);
  console.log("[S3 Upload] Buffer length:", buffer.length);
  console.log("[S3 Upload] S3 Key:", key);

  const response = await s3.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ACL: "private",
    })
  );

  console.log("[S3 Upload] Upload response:", response);

  return key;
}

export async function getFileUrl(key: string): Promise<string> {
  const cleanKey = key.replace(/^\/+/, "").replace(/\/+$/, "");
  console.log("[S3 getFileUrl] Requested key:", key);
  console.log("[S3 getFileUrl] Cleaned key:", cleanKey);

  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: cleanKey,
    ResponseContentDisposition: "inline",
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
  console.log("[S3 getFileUrl] Signed URL:", url);

  return url;
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
