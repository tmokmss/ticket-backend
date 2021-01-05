import * as aws from "aws-sdk";
import { Request, Response } from "express";

aws.config.update({
    region: process.env.AWS_REGION ?? 'ap-northeast-1',
});

const ddb = aws.DynamoDB;
const docClient = new ddb.DocumentClient();
const ticketTableName = 'travel-stage-StorageStack-ticketTable4EA4FD6F-C75N5FQ85560';

export async function createTicket(req: Request, res: Response) {
    const travelId = req.body.travelId;

    try {
        const response = await docClient.put({
            TableName: ticketTableName,
            Item: {
                "userId": getUserId(),
                "travelId": travelId,
                "boughtAt": Date.now(),
            },
        }).promise();
        res.send(response);
    } catch (e) {
        console.log(e);
        res.send(e);
    }
}

export async function getTicket(req: Request, res: Response) {
}

function getUserId() {
    return "test";
}