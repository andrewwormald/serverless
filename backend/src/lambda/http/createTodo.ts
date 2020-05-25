import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from "../../requests/CreateTodoRequest";

import { v4 as uuidv4 } from 'uuid';
import { Verify } from '../auth/auth0Authorizer'
import * as AWS from "aws-sdk";
import {HandleError} from "../utils";
const docClient = new AWS.DynamoDB.DocumentClient()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const userId = Verify(event.headers.Authorization).sub
    return await Process(userId, newTodo)
  } catch (e) {
    return HandleError(e)
  }
}

async function Process(userId: string, newTodo: CreateTodoRequest): Promise<APIGatewayProxyResult> {
  const newItem = {
    userId: userId,
    todoId: uuidv4(),
    createdAt: Date.now().toString(),
    done: false,
    ...newTodo
  }

  await docClient.put({ // Call parameters
    TableName: 'udacity_todo',
    Item: newItem,
  }).promise()

  const resp = {
    item: newItem
  }

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(resp)
  }
}
