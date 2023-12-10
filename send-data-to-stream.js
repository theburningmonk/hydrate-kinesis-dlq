const { KinesisClient, PutRecordCommand } = require("@aws-sdk/client-kinesis")
const kinesisClient = new KinesisClient({ region: "us-east-1" })

async function sendDataToStream() {
  const data = "Hello, theburningmonk!"

  const putRecordCommand = new PutRecordCommand({
    StreamName: process.env.STREAM_NAME,
    PartitionKey: 'one partition',
    Data: Buffer.from(data)
  })
  
  try {
    await kinesisClient.send(putRecordCommand)
  } catch (error) {
    console.error("Error sending data:", error)
  }
}

setInterval(sendDataToStream, 10000)
