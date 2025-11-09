import express from 'express';
import path from 'path';

export function setupUploads(app: express.Application) {
  // Serve uploaded files statically
  const uploadsPath = path.join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));
  
  console.log('[Uploads] Static file serving enabled at /uploads');
}
