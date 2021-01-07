import { Context, SNSEvent, SNSMessage } from "aws-lambda";
import axios from "axios";

const webhookUrl = process.env.SLACK_WEBHOOK_URL!;

async function sendSlackMessage(record: SNSMessage) {
    console.log(record);
    const json = JSON.parse(record.Message);
    await axios.post(webhookUrl, {
        text: {
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": json.detailType,
                        "emoji": true
                    }
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": `*Region:*\n${json.region}`
                        },
                        {
                            "type": "mrkdwn",
                            "text": `*Pipeline:*\n${json.detail.pipeline}`
                        },
                        {
                            "type": "mrkdwn",
                            "text": `*Status:*\n${json.detail.state}`
                        },
                        {
                            "type": "mrkdwn",
                            "text": `*ExecutionId:*\n${json.detail["execution-id"]}`
                        },
                        {
                            "type": "mrkdwn",
                            "text": `*Time:*\n${json.time}`
                        },
                    ]
                },
            ]
        },
    });
}

export const lambdaHandler = async (
    event: SNSEvent,
    context: Context
) => {
    console.log(event);
    await Promise.all(event.Records.map(r => sendSlackMessage(r.Sns)));
}
