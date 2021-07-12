import mongodb from 'mongodb';

const MongoClient = mongodb.MongoClient;
const uri = encodeURI(process.env.MONGO_URI);

export const client = new MongoClient(uri, { useNewUrlParser: true });

export async function connectDb() {
  try {
    await client.connect();

    // Confirm DB Connection
    await client.db('admin').command({ ping: 1 });
    console.log('🗄  Successfully connected to MongoDB');
  } catch (err) {
    console.error(err);

    // Close connection on error
    await client.close();
  }
}
