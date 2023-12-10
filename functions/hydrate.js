const { 
  KinesisClient, 
  GetShardIteratorCommand,
  GetRecordsCommand
} = require("@aws-sdk/client-kinesis")
const kinesisClient = new KinesisClient()

/**
 * @param {import('aws-lambda').SNSEvent} event 
 */
module.exports.handler = async (event) => {
  const snsMessage = JSON.parse(event.Records[0].Sns.Message)
  const { shardId, startSequenceNumber, batchSize, streamArn } = snsMessage.KinesisBatchInfo

  const streamName = streamArn.split('/')[1]
  const getShardIteratorCmd = new GetShardIteratorCommand({
    ShardId: shardId,
    ShardIteratorType: 'AT_SEQUENCE_NUMBER',
    StartingSequenceNumber: startSequenceNumber,
    StreamName: streamName
  })
  const shardIteratorResp = await kinesisClient.send(getShardIteratorCmd)


  const getRecordsCmd = new GetRecordsCommand({
    ShardIterator: shardIteratorResp.ShardIterator,
    Limit: batchSize,
    StreamARN: streamArn
  })

  const getRecordsResp = await kinesisClient.send(getRecordsCmd)
  const records = getRecordsResp.Records.map(record => {
    const decodedData = Buffer.from(record.Data, 'base64').toString('utf-8')
    return decodedData
  })

  return {
    ...snsMessage,
    KinesisBatch: records
  }
}
