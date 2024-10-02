import Queue from 'bull';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import mime from 'mime-types';
import dbClient from '../utils/db';
import { getUserFromToken } from '../utils/auth';

const fileQueue = new Queue('fileQueue');

class FilesController {
  // ... existing methods ...

  static async postUpload(req, res) {
    // ... existing upload logic ...

    // After successful file upload, if file type is image, add to thumbnail generation queue
    if (file.type === 'image') {
      await fileQueue.add({
        userId: user._id.toString(),
        fileId: file._id.toString()
      });
    }

    // ... rest of the upload logic ...
  }

  static async getFile(req, res) {
    try {
      const fileId = req.params.id;
      const { size } = req.query;
      
      if (!ObjectId.isValid(fileId)) {
        return res.status(404).json({ error: 'Not found' });
      }

      const filesCollection = dbClient.db.collection('files');
      const file = await filesCollection.findOne({ _id: ObjectId(fileId) });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      const user = await getUserFromToken(req);
      if (!file.isPublic && (!user || user._id.toString() !== file.userId.toString())) {
        return res.status(404).json({ error: 'Not found' });
      }

      if (file.type === 'folder') {
        return res.status(400).json({ error: 'A folder doesn\'t have content' });
      }

      let filePath = file.localPath;

      // Handle thumbnail size if specified
      if (size && ['500', '250', '100'].includes(size)) {
        const thumbnailPath = `${filePath}_${size}`;
        if (fs.existsSync(thumbnailPath)) {
          filePath = thumbnailPath;
        } else {
          return res.status(404).json({ error: 'Not found' });
        }
      }

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Not found' });
      }

      const mimeType = mime.lookup(file.name) || 'application/octet-stream';
      const fileContent = fs.readFileSync(filePath);
      res.setHeader('Content-Type', mimeType);
      return res.send(fileContent);

    } catch (error) {
      console.error('Error retrieving file:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default FilesController;
