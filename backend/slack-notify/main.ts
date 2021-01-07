import { Context, SNSEvent, SNSMessage } from "aws-lambda";
import axios from "axios";

const webhookUrl = process.env.SLACK_WEBHOOK_URL!;

async function sendSlackMessage(record: SNSMessage) {
    console.log(record);
    await axios.post(webhookUrl, {
        text: record.Message,
    });
}

export const lambdaHandler = async (
    event: SNSEvent,
    context: Context
) => {
    console.log(event);
    await Promise.all(event.Records.map(r => sendSlackMessage(r.Sns)));
}
