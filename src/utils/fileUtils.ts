import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';

export async function downloadFile(url: string, filename: string): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'uploads', 'videos');
  await fs.mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, filename);
  const response = await fetch(url);
  const buffer = await response.buffer();
  await fs.writeFile(filePath, buffer);

  return filePath;
}
