import { Context, SNSEvent, SNSMessage } from "aws-lambda";
import axios from "axios";

const webhookUrl = process.env.SLACK_WEBHOOK_URL!;

async function sendSlackMessage(record: SNSMessage) {
    const json = JSON.parse(record.Message);
    const url = `https://${json.region}.console.aws.amazon.com/codesuite/codepipeline/pipelines/${json.detail.pipeline}/executions/${json.detail["execution-id"]}/timeline`;

    const body = {
        "attachments": [
            {
                "color": json.detail.state == "SUCCEEDED" ? "#36a64f" : "#ff6666",
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
                                "text": `*Time:*\n${json.time}`
                            },
                            {
                                "type": "mrkdwn",
                                "text": `*ExecutionId:*\n<${url}|${json.detail["execution-id"]}>`
                            },
                        ]
                    },
                ],
            }
        ]
    }
    console.log(body);
    await axios.post(webhookUrl, body);
}

export const lambdaHandler = async (
    event: SNSEvent,
    context: Context
) => {
    console.log(event);
    await Promise.all(event.Records.map(r => sendSlackMessage(r.Sns)));
}
