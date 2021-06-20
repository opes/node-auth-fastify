import mongodb from 'mongodb';

const MongoClient = mongodb.MongoClient;
const uri = process.env.MONGO_URI;

export const client = new MongoClient(uri, { useNewUrlParser: true });

export async function connectDb() {
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('🗄  Connected to MongoDB');
  } catch (err) {
    console.error(err);
    await client.close();
  }
}
