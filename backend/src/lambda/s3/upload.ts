import 'source-map-support/register'
import {S3EventRecord, SNSEvent, SNSHandler} from 'aws-lambda'
import {AddAttachmentUrl} from "../../db/dynamo";
import {seperatorKey} from "../../fileStorage/fileStorage";
import { createLogger } from '../../utils/logger'

const logger = createLogger('auth')

export const handler: SNSHandler = async (event: SNSEvent) => {
  logger.info('Processing SNS event ', event)

  for (const snsRecord of event.Records) {
    const s3EventStr = snsRecord.Sns.Message

    logger.info('Processing S3 event', {
      msg: s3EventStr
    })

    const s3Event = JSON.parse(s3EventStr)

    for (const record of s3Event.Records) {
      await processImage(record)
    }
  }
}

async function processImage(record: S3EventRecord) {
  const keys = record.s3.object.key.split(seperatorKey)
  const userId = keys[0]
  const todoId = keys[1]

  await AddAttachmentUrl(decodeURI(todoId), decodeURI(userId))
}

