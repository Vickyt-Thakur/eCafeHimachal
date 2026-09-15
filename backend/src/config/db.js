import mongoose from 'mongoose';

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set. Copy backend/.env.example to backend/.env and set it.');
  if (!uri.startsWith('mongodb+srv://')) throw new Error('MONGODB_URI must be a MongoDB Atlas connection string beginning with mongodb+srv://.');

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log('MongoDB Atlas Connected Successfully');
  } catch (error) {
    console.error(`MongoDB Connection Failed: ${error.message}`);
    throw error;
  }
}
