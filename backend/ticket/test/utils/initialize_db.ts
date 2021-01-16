import { ddb } from "../../util/dynamodb";

const ticketDbName = "test_ticket";

export async function initializeDynamoDB() {
    const tables = await ddb.listTables().promise();
    process.env.TICKET_TABLE_NAME = ticketDbName;
    if (!tables.TableNames?.find(t => t == ticketDbName)) {
        await ddb.createTable({
            TableName: ticketDbName,
            AttributeDefinitions: [
                {
                    AttributeName: 'userId',
                    AttributeType: 'S',
                },
                {
                    AttributeName: 'travelId',
                    AttributeType: 'S',
                },
            ],
            KeySchema: [
                {
                    AttributeName: 'userId',
                    KeyType: 'HASH',
                },
                {
                    AttributeName: 'travelId',
                    KeyType: 'SORT',
                },
            ],
            BillingMode: 'PAY_PER_REQUEST',
        }).promise();
    }
}

export async function finalizeDynamoDB() {
    await ddb.deleteTable({
        TableName: ticketDbName,
    }).promise();
}
