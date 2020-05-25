import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import * as AWS from "aws-sdk";
import {Verify} from "../auth/auth0Authorizer";
import {HandleError} from "../utils";
const docClient = new AWS.DynamoDB.DocumentClient()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const todoId = event.pathParameters.todoId
    const userId = (await Verify(event.headers.Authorization)).sub
    return await Process(userId, todoId)
  } catch(e) {
    return HandleError(e)
  }
}

async function Process(userId, todoId: string): Promise<APIGatewayProxyResult> {
  let key = {
    'todoId': todoId,
    'userId': userId
  }

  await docClient.delete({ // Call parameters
    TableName: 'udacity_todo',
    Key: key,
  }).promise()

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(todoId)
  }
}
