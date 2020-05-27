import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import {Verify} from "../auth/auth0Authorizer";
import {HandleError} from "../utils";
import {Delete} from "../../db/dynamo";
import { createLogger } from '../../utils/logger'

const logger = createLogger('delete')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing delete event', event)
  try {
    const todoId = event.pathParameters.todoId
    const userId = (await Verify(event.headers.Authorization)).sub
    return await Process(todoId, userId)
  } catch(e) {
    return HandleError(e)
  }
}

async function Process(todoId, userId: string): Promise<APIGatewayProxyResult> {
  await Delete(todoId, userId)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(todoId)
  }
}
