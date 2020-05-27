import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { HandleError } from "../utils";
import {Verify} from "../auth/auth0Authorizer";
import {CollectForUser} from "../../db/dynamo";
import {CreateGetSignedUrl} from "../../fileStorage/fileStorage";
import { createLogger } from '../../utils/logger'

const logger = createLogger('collect')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing collect all event', event)
    try {
        const auth = event.headers.Authorization
        const userId = Verify(auth).sub

        logger.info('Processing collect all todos for user', {
            userId: userId
        })

        return await Process(userId)
    } catch (e) {
        return HandleError(e)
    }
}

async function Process(userId: string): Promise<APIGatewayProxyResult> {
    const result = await CollectForUser(userId)

    result.items.map(item => {
        if (item.attachmentKey) {
            item['attachmentUrl'] = CreateGetSignedUrl(item.todoId, userId)
        }
    })

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(result)
    }
}
