import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from "../../requests/CreateTodoRequest";
import { Verify } from '../auth/auth0Authorizer'
import {HandleError} from "../utils";
import {Create} from "../../db/dynamo";
import { createLogger } from '../../utils/logger'

const logger = createLogger('create')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event', event)

  try {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const userId = Verify(event.headers.Authorization).sub
    logger.info('Processing for user', userId)
    return await Process(userId, newTodo)
  } catch (e) {
    return HandleError(e)
  }
}

async function Process(userId: string, newTodo: CreateTodoRequest): Promise<APIGatewayProxyResult> {
  const newItem = {
    done: false,
    ...newTodo
  }

  const result = await Create(userId, newItem)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(result)
  }
}
