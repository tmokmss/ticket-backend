import * as aws from "aws-sdk";

aws.config.update({
    region: process.env.AWS_REGION ?? 'ap-northeast-1',
});

if (process.env.DYNAMODB_ENDPOINT != null) {
    console.log(`use DynamoDB Endpoint: ${process.env.DYNAMODB_ENDPOINT}`);
    aws.config.dynamodb = { endpoint: process.env.DYNAMODB_ENDPOINT };
}

export const ddb = new aws.DynamoDB();
export const docClient = new aws.DynamoDB.DocumentClient();
