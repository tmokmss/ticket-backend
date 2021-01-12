import { docClient } from "../util/dynamodb";

const ticketTableName = process.env.TICKET_TABLE_NAME ?? 'travel-stage-StorageStack-ticketTable4EA4FD6F-C75N5FQ85560';

interface TicketProps {
    userId: string,
    travelId: string,
    boughtAt?: number,
}

export class Ticket {
    readonly userId: string;
    readonly travelId: string;

    constructor(props: TicketProps) {
        this.userId = props.userId;
        this.travelId = props.travelId;
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

    async cancel() {
        const response = await docClient.delete({
            TableName: ticketTableName,
            Key: {
                "userId": this.userId,
                "travelId": this.travelId,
            },
        }).promise();

        return response;
    }
}
