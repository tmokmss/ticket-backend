import * as cs from '@aws-cdk/aws-codestarnotifications';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as sns from '@aws-cdk/aws-sns';
import * as iam from '@aws-cdk/aws-iam';
import { Construct, SecretValue, Stack, StackProps } from '@aws-cdk/core';

export interface CodePipelineNotificationProps {
    topic: sns.Topic,
    pipeline: codepipeline.Pipeline,
}

export class CodePipelineNotification extends Construct {
    constructor(scope: Construct, id: string, props: CodePipelineNotificationProps) {
        super(scope, id);

        const rule = new cs.CfnNotificationRule(this, 'notification', {
            detailType: "FULL",
            eventTypeIds: [
                "codepipeline-pipeline-pipeline-execution-failed",
                "codepipeline-pipeline-pipeline-execution-succeeded",
                "codepipeline-pipeline-pipeline-execution-canceled",
            ],
            name: this.node.addr,
            resource: props.pipeline.pipelineArn,
            targets: [
                {
                    targetType: "SNS",
                    targetAddress: props.topic.topicArn,
                }
            ]
        });

        props.topic.addToResourcePolicy(new iam.PolicyStatement({
            actions: [
                "SNS:Publish"
            ],
            principals: [
                new iam.ServicePrincipal("codestar-notifications.amazonaws.com")
            ],
            effect: iam.Effect.ALLOW,
            resources: [
                props.topic.topicArn,
            ]
        }))
    }
}
