import { docClient } from "../util/dynamodb";

const ticketTableName = process.env.TICKET_TABLE_NAME ?? 'dev-stage-StorageStack-ticketTable4EA4FD6F-XFIGX5JCMSQN';

export interface TicketProps {
    userId: string,
    travelId: string,
    boughtAt?: number,
}

export class Ticket {
    readonly userId: string;
    readonly travelId: string;
    readonly boughtAt: Date;

    constructor(props: TicketProps) {
        this.userId = props.userId;
        this.travelId = props.travelId;
        this.boughtAt = new Date(props.boughtAt ?? 0);
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

        return response['Items']!.map(item => new Ticket({
            userId: item.userId,
            travelId: item.travelId,
            boughtAt: item.boughtAt,
        }));
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
