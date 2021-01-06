import { docClient } from "../util/dynamodb";

const ticketTableName = process.env.TICKET_TABLE_NAME ?? 'travel-stage-StorageStack-ticketTable4EA4FD6F-C75N5FQ85560';

interface TicketProps {
    userId: string,
    boughtAt: number,
    travelId: number,
}

export class Ticket {
    readonly userId: string;

    constructor(props: TicketProps) {
        this.userId = props.userId;
    }

    static async create(userId: string, travelId: number) {
        const response = await docClient.put({
            TableName: ticketTableName,
            Item: {
                "userId": userId,
                "travelId": travelId,
                "boughtAt": Date.now(),
            },
        }).promise();

        return response;
    }

    static async query(userId: string) {
        const response = await docClient.query({
            TableName: ticketTableName,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId,
            },
        }).promise();

        return response;
    }
}
