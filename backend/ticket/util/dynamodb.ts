import * as aws from "aws-sdk";

aws.config.update({
    region: process.env.AWS_REGION ?? 'ap-northeast-1',
});

export const ddb = aws.DynamoDB;
export const docClient = new ddb.DocumentClient();
