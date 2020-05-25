import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import {Verify} from "../auth/auth0Authorizer";
import {HandleError} from "../utils";
import * as AWS from "aws-sdk";

const s3 = new AWS.S3()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const todoId = event.pathParameters.todoId
    const userId = Verify(event.headers.Authorization).sub
    return await Process(todoId, userId)
  } catch (e) {
    return HandleError(e)
  }
}

async function Process(todoId, userId: string): Promise<APIGatewayProxyResult> {
  const params = {Bucket: 'todo-attachments', Key: userId + todoId, Expires: 200};
  const url = s3.getSignedUrl('putObject', params);

  const resp = {
    uploadUrl: url
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(resp)
  }
}
