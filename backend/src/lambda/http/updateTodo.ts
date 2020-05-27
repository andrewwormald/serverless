import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import {HandleError} from "../utils";
import {Verify} from "../auth/auth0Authorizer";
import {UpdateTodo} from "../../db/dynamo";
import { createLogger } from '../../utils/logger'

const logger = createLogger('update')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing update event', event)
  try {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    const userId = Verify(event.headers.Authorization).sub

    logger.info('Updating todo with id', {
      userId: userId,
      todoId: todoId
    })

    return await Process(todoId, userId, updatedTodo)
  } catch (e) {
    return HandleError(e)
  }
}

async function Process(todoId, userId: string, updatedTodo: UpdateTodoRequest): Promise<APIGatewayProxyResult> {
  const result = await UpdateTodo(todoId, userId, updatedTodo)
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(result)
  }
}
