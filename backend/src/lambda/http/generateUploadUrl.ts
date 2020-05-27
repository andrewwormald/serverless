import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import {Verify} from "../auth/auth0Authorizer";
import { HandleError } from "../utils";
import { CreatePutSignedUrl } from "../../fileStorage/fileStorage";
import { createLogger } from '../../utils/logger'

const logger = createLogger('generateURL')


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing signed url request event', event)
  try {
    const todoId = event.pathParameters.todoId
    const userId = Verify(event.headers.Authorization).sub

    logger.info('Creating signed url for user', {
      userId: userId
    })

    return await Process(todoId, userId)
  } catch (e) {
    return HandleError(e)
  }
}

async function Process(todoId, userId: string): Promise<APIGatewayProxyResult> {
  const resp = CreatePutSignedUrl(todoId, userId)
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(resp)
  }
}

