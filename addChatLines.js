const { MongoClient, Server, ObjectId } = require('mongodb');
const fs = require('fs');
const readline = require('readline');
const uri =  "mongodb://10.161.9.215:27017/roomsChat?serverSelectionTimeoutMS=5000&connectTimeoutMS=10000";
const uri2 = "mongodb://10.161.9.100/webrtc_dev?retryWrites=true&w=majority";
const client = new MongoClient(uri);
const client2 = new MongoClient(uri2);

const data = fs.readFileSync('./chatlines.txt').toString();
const totalLines = data.split('\n').length;
const channelId = new ObjectId('612778827782b80e77413cb2');

const startDate = new Date(Date.parse('01 Jan 2021 00:12:00 GMT'));
const endDate = new Date();

const dateDiff = endDate.getTime() - startDate.getTime();
console.log(dateDiff);
const dateAvg = dateDiff / totalLines;
console.log(dateAvg);



async function processLineByLine() {
  try {

    await client.connect();
  } catch(e) {
    console.log('E', e);
    process.exit();
  }
  await client2.connect();
  const users = await client2.db().collection('users').find().toArray();
  // console.log('Users', users);
  console.log('Connected!');
  const fileStream = fs.createReadStream('./chatlines.txt');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  let cnt = 0;
  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.
    const now = new Date(startDate.getTime() + (cnt++ * dateAvg));
    console.log(now);
    console.log(`Line from file: ${line}`);
    console.log(client);
    try {
      await client.db().collection('messages').insertOne({
        message: line,
        from: users[Math.floor(Math.random()*users.length)],
        channel: channelId,
        date: now,
      });
    } catch(e) {
      console.log('E', e);
    }
    console.log('Doc Inserted');
  }
}

processLineByLine();