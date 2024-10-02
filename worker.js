import Queue from 'bull';
import imageThumbnail from 'image-thumbnail';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import { promisify } from 'util';
import dbClient from './utils/db';

const fileQueue = new Queue('fileQueue');
const userQueue = new Queue('userQueue');
const writeFileAsync = promisify(fs.writeFile);

/* Existing file processing code */
async function generateThumbnail(path, width) {
  try {
    const thumbnail = await imageThumbnail(path, { width });
    await writeFileAsync(`${path}_${width}`, thumbnail);
  } catch (error) {
    console.error(`Error generating ${width} thumbnail:`, error);
  }
}

fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }

  if (!userId) {
    throw new Error('Missing userId');
  }

  const filesCollection = dbClient.db.collection('files');
  const file = await filesCollection.findOne({
    _id: ObjectId(fileId),
    userId: ObjectId(userId)
  });

  if (!file) {
    throw new Error('File not found');
  }

  const thumbnailWidths = [500, 250, 100];
  const thumbnailPromises = thumbnailWidths.map(width => 
    generateThumbnail(file.localPath, width)
  );

  await Promise.all(thumbnailPromises);
});

/* New user welcome email processing */
userQueue.process(async (job) => {
  const { userId } = job.data;

  if (!userId) {
    throw new Error('Missing userId');
  }

  const usersCollection = dbClient.db.collection('users');
  const user = await usersCollection.findOne({ _id: ObjectId(userId) });

  if (!user) {
    throw new Error('User not found');
  }

  console.log(`Welcome ${user.email}!`);
  
  // In a real-world scenario, you would send an actual email here
  // Example with a hypothetical email service:
  /*
  await emailService.send({
    to: user.email,
    subject: 'Welcome to Files Manager',
    text: `Welcome ${user.email}! We're glad you joined us.`
  });
  */
});

export { fileQueue, userQueue };
