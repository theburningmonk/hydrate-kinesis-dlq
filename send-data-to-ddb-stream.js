const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb")
const client = new DynamoDBClient({ region: "us-east-1" })

async function writeItemToDynamoDB() {
  try {
    const putItemCmd = new PutItemCommand({
      TableName: process.env.TABLE_NAME,
      Item: {
        id: { S: new Date().toISOString() }, 
      }
    })

    await client.send(putItemCmd)
  } catch (error) {
    console.error("Error writing item to DynamoDB:", error)
  }
}

setInterval(writeItemToDynamoDB, 10000)
