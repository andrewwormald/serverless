import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import { parseUserId } from "../auth/utils";
import {AWSError} from "aws-sdk/lib/error";

/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  return parseUserId(jwtToken)
}

export function HandleError(e: any) {
  if (e.statusCode) {
    return handleAWSError(e)
  }

  return handleNormalError(e)
}

function handleNormalError(e: any): APIGatewayProxyResult {
  const custom = {
    error: e,
  }

  return {
    statusCode: 500,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(custom)
  }
}

function handleAWSError(e: AWSError, params?: string[]): APIGatewayProxyResult {
  const custom = {
    error: e.message,
    statusCode: e.statusCode,
    params: params
  }

  return {
    statusCode: custom.statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(custom)
  }
}
