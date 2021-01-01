import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as sns from '@aws-cdk/aws-sns';
import * as sqs from '@aws-cdk/aws-sqs';
import * as subscriptions from '@aws-cdk/aws-sns-subscriptions';
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
                buildCommand: 'npm run build'
            }),
        });

        const topic = new sns.Topic(this, `topic`, {

        });

        const queue = new sqs.Queue(this, 'queue');

        topic.addSubscription(new subscriptions.SqsSubscription(queue));

        pipeline.addApplicationStage(new DevStage(this, `dev-stage`));

        new CodePipelineNotification(this, `notification`, {
            topic: topic,
            pipeline: pipeline.codePipeline,
        });
    }
}