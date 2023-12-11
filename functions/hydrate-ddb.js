const { 
  DynamoDBStreamsClient, 
  GetShardIteratorCommand,
  GetRecordsCommand
} = require("@aws-sdk/client-dynamodb-streams")
const { unmarshall } = require('@aws-sdk/util-dynamodb')
const ddbStreamClient = new DynamoDBStreamsClient()

/**
 * @param {import('aws-lambda').SNSEvent} event 
 */
module.exports.handler = async (event) => {
  const snsMessage = JSON.parse(event.Records[0].Sns.Message)
  const { shardId, startSequenceNumber, batchSize, streamArn } = snsMessage.DDBStreamBatchInfo

  const getShardIteratorCmd = new GetShardIteratorCommand({
    ShardId: shardId,
    ShardIteratorType: 'AT_SEQUENCE_NUMBER',
    SequenceNumber: startSequenceNumber,
    StreamArn: streamArn
  })
  const shardIteratorResp = await ddbStreamClient.send(getShardIteratorCmd)

  const getRecordsCmd = new GetRecordsCommand({
    ShardIterator: shardIteratorResp.ShardIterator,
    Limit: batchSize
  })

  const getRecordsResp = await ddbStreamClient.send(getRecordsCmd)
  const records = getRecordsResp.Records.map(record => {
    const newImage = record.dynamodb.NewImage ? unmarshall(record.dynamodb.NewImage) : null
    const oldImage = record.dynamodb.OldImage ? unmarshall(record.dynamodb.OldImage) : null
    const eventName = record.eventName
    return {
      eventName,
      newImage,
      oldImage
    }
  })

  return {
    ...snsMessage,
    DynamoDBChanges: records
  }
}
