import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export async function saveUploadedImage(file: File, folder: "entry" | "exit") {
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name || ".jpg") || ".jpg";
  const fileName = `${randomUUID()}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), bytes);
  return `/uploads/${folder}/${fileName}`;
}
