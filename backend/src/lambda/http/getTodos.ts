import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from "aws-sdk";
import { HandleError } from "../utils";
import {Verify} from "../auth/auth0Authorizer";

const s3 = new AWS.S3()
const docClient = new AWS.DynamoDB.DocumentClient()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const auth = event.headers.Authorization
        const userId = Verify(auth).sub
        return await Process(userId)
    } catch (e) {
        return HandleError(e)
    }
}

async function Process(userId: string): Promise<APIGatewayProxyResult> {
    const result = await docClient.query({
        TableName: "udacity_todo",
        Limit: 50,
        IndexName: 'udacity_todoId_index',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
    }).promise()


    result.Items.map(item => {
        const params = {Bucket: 'todo-attachments', Key: item.userId + item.todoId, Expires: 10000};
        const url = s3.getSignedUrl('getObject', params)
        item.attachment = url
    })

    const resp = {
        items: result.Items
    }

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(resp)
    }
}
