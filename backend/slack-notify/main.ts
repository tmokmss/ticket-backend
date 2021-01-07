import { SNSMessage, Context } from "aws-lambda";
import axios from "axios";

const webhookUrl = process.env.SLACK_WEBHOOK_URL!;

export const lambdaHandler = async (
    event: SNSMessage,
    context: Context
) => {
    console.log(event);
    const message = event.Message;
    await axios.post(webhookUrl, {
        data: {
            text: message,
        },
        headers: {
            "Content-type": "application/json",
        },
    });
}
