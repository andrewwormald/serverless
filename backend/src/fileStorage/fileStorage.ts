import * as AWS from "aws-sdk";

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3()

export interface SingerURL {
    uploadUrl: string
}
export function CreatePutSignedUrl(todoId, userId: string): SingerURL {
    const params = {Bucket: 'todo-attachments', Key: CreateKey(todoId, userId), Expires: 200};
    const url = s3.getSignedUrl('putObject', params);

    return {
        uploadUrl: url
    }
}

export function CreateGetSignedUrl(todoId, userId: string): string{
    const signedUrlExpireSeconds = 60 * 5

    return s3.getSignedUrl('getObject', {
        Bucket: 'todo-attachments',
        Key: CreateKey(todoId, userId),
        Expires: signedUrlExpireSeconds
    });
}

export const seperatorKey = '-attachment-'
export function CreateKey(todoId, userId: string): string {
    return userId + seperatorKey +todoId
}
