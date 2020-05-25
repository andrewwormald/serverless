import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import * as AWS from "aws-sdk";
import {HandleError} from "../utils";
import {Verify} from "../auth/auth0Authorizer";
const docClient = new AWS.DynamoDB.DocumentClient()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    const userId = Verify(event.headers.Authorization).sub
    return await Process(todoId, userId, updatedTodo)
  } catch (e) {
    return HandleError(e)
  }
}

async function Process(todoId, userId: string, updatedTodo: UpdateTodoRequest): Promise<APIGatewayProxyResult> {
  let key = {
    'todoId': todoId,
    'userId': userId
  }

  const result = await docClient.update({ // Call parameters
    TableName: 'udacity_todo',
    Key: key,
    UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
    ExpressionAttributeNames: {
      "#name": "name"
    },
    ExpressionAttributeValues: {
      ':name': updatedTodo.name,
      ':dueDate': updatedTodo.dueDate,
      ':done': updatedTodo.done
    },
    ReturnValues:"UPDATED_NEW"
  }).promise()

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(result)
  }
}
