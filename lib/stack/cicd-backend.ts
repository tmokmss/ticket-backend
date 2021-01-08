import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as sns from '@aws-cdk/aws-sns';
import * as sub from '@aws-cdk/aws-sns-subscriptions';
import * as lambdanode from '@aws-cdk/aws-lambda-nodejs';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import { Construct, SecretValue, Stack, StackProps } from '@aws-cdk/core';
import { CdkPipeline, SimpleSynthAction } from "@aws-cdk/pipelines";
import { DevStage } from '../stage/dev';
import { CodePipelineNotification } from '../construct/codepipeline-notification';

export class CicdBackendStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const sourceArtifact = new codepipeline.Artifact();
        const cloudAssemblyArtifact = new codepipeline.Artifact();

        const pipeline = new CdkPipeline(this, 'Pipeline', {
            pipelineName: 'OctankTravelBackend',
            cloudAssemblyArtifact,

            sourceAction: new codepipeline_actions.GitHubSourceAction({
                actionName: 'GitHub',
                output: sourceArtifact,
                oauthToken: SecretValue.secretsManager('github-token'),
                owner: 'tmokmss',
                repo: 'ticket-backend',
            }),

            synthAction: SimpleSynthAction.standardNpmSynth({
                sourceArtifact,
                cloudAssemblyArtifact,
                buildCommand: 'npm run build',
            }),
        });

        pipeline.addApplicationStage(new DevStage(this, `dev-stage`));

        const topic = new sns.Topic(this, `topic`);
        new CodePipelineNotification(this, `notification`, {
            topic: topic,
            pipeline: pipeline.codePipeline,
        });

        const slackNotifier = new lambdanode.NodejsFunction(this, 'slack-notifier', {
            entry: 'backend/slack-notify/main.ts',
            handler: 'lambdaHandler',
            depsLockFilePath: 'backend/slack-notify/package-lock.json',
            bundling: {
                minify: false,
                nodeModules: [
                    "axios",
                ],
            },
            environment: {
                "SLACK_WEBHOOK_URL": SecretValue.secretsManager('slack-webhook-url').toString(),
            }
        });

        topic.addSubscription(new sub.LambdaSubscription(slackNotifier));
    }
}
