import {CreateTodoRequest} from "../requests/CreateTodoRequest";
import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";
import {CreateKey} from "../fileStorage/fileStorage";
import { v4 as uuidv4 } from 'uuid';
import * as AWS from "aws-sdk";

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
const docClient = new XAWS.DynamoDB.DocumentClient()

export interface ItemResponse {
    item: any
}
export async function Create(userId: string, newItem: CreateTodoRequest): Promise<ItemResponse> {
    const item = {
        todoId: uuidv4(),
        userId: userId,
        createdAt: Date.now().toString(),
        ...newItem
    }

    await docClient.put({ // Call parameters
        TableName: 'udacity_todo',
        Item: item,
    }).promise()

    return {
        item: item
    }
}

export interface CollectResponse {
    items: any
}
export async function CollectForUser(userId: string): Promise<CollectResponse> {
    const result = await docClient.query({
        TableName: "udacity_todo",
        Limit: 50,
        IndexName: 'udacity_todoId_index',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
    }).promise()

    return {
        items: result.Items
    }
}

export async function AddAttachmentUrl(todoId, userId): Promise<ItemResponse> {
    const result = await docClient.update({ // Call parameters
        TableName: 'udacity_todo',
        Key: {
            'todoId': todoId,
            'userId': userId
        },
        UpdateExpression: `set attachmentKey = :key`,
        ExpressionAttributeValues: {
            ':key': CreateKey(todoId, userId)
        },
        ReturnValues:"UPDATED_NEW"
    }).promise()

    return {
        item: result.Attributes
    }
}

export async function UpdateTodo(todoId, userId: string, todo: UpdateTodoRequest): Promise<ItemResponse> {
    const result = await docClient.update({ // Call parameters
        TableName: 'udacity_todo',
        Key: {
            'todoId': todoId,
            'userId': userId
        },
        UpdateExpression: `set #name = :name,
                       dueDate = :dueDate,
                       done = :done`,
        ExpressionAttributeNames: {
            "#name": "name"
        },
        ExpressionAttributeValues: {
            ':name': todo.name,
            ':dueDate': todo.dueDate,
            ':done': todo.done
        },
        ReturnValues:"UPDATED_NEW"
    }).promise()

    return {
        item: result.Attributes
    }
}

export async function Delete(todoId, userId: string) {
    await docClient.delete({ // Call parameters
        TableName: 'udacity_todo',
        Key: {
            'todoId': todoId,
            'userId': userId
        },
    }).promise()
}
