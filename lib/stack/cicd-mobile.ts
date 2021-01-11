import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codebuild from '@aws-cdk/aws-codebuild';
import * as sns from '@aws-cdk/aws-sns';
import * as sub from '@aws-cdk/aws-sns-subscriptions';
import * as s3 from '@aws-cdk/aws-s3';
import * as iam from '@aws-cdk/aws-iam';
import * as lambdanode from '@aws-cdk/aws-lambda-nodejs';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import { App, Construct, SecretValue, Stack, StackProps } from '@aws-cdk/core';
import { CodePipelineNotification } from '../construct/codepipeline-notification';
import { DeviceFarmAction, AppType, TestType } from '../construct/devicefarm-action';

export class CicdMobileStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const sourceArtifact = new codepipeline.Artifact();
        const buildArtifact = new codepipeline.Artifact();

        const devicefarmProject = new codebuild.PipelineProject(this, 'apk-project', {
            environment: {
                buildImage: codebuild.LinuxBuildImage.STANDARD_4_0,
                computeType: codebuild.ComputeType.SMALL,
                environmentVariables: {
                    // Get devicePoolArn by executing: aws devicefarm list-device-pools --arn arn:aws:devicefarm:us-west-2:198634196645:project:87aa9613-de9f-47fe-b8df-a359659ced05 --region us-west-2
                    "PROJECT_ARN": { value: "arn:aws:devicefarm:us-west-2:198634196645:project:87aa9613-de9f-47fe-b8df-a359659ced05" },
                    "DEVICEPOOL_ARN": { value: "arn:aws:devicefarm:us-west-2:198634196645:devicepool:87aa9613-de9f-47fe-b8df-a359659ced05/ea3114d0-fbdd-458a-b5e0-15a875b38e32" },
                },
            },
        });

        devicefarmProject.role?.addToPrincipalPolicy(
            new iam.PolicyStatement({
                actions: [
                    "devicefarm:ListProjects",
                    "devicefarm:ListDevicePools",
                    "devicefarm:GetRun",
                    "devicefarm:GetUpload",
                    "devicefarm:CreateUpload",
                    "devicefarm:ScheduleRun",
                ],
                effect: iam.Effect.ALLOW,
                resources: ['*'],
            })
        );

        const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
            pipelineName: "travel-app",
            crossAccountKeys: false,
            stages: [
                {
                    stageName: 'Source',
                    actions: [
                        new codepipeline_actions.GitHubSourceAction({
                            actionName: 'Source',
                            oauthToken: SecretValue.secretsManager('github-token'),
                            owner: 'tmokmss',
                            repo: 'ticket-app',
                            output: sourceArtifact,
                        }),
                    ],
                },
                {
                    stageName: 'Build-apk',
                    actions: [
                        new codepipeline_actions.CodeBuildAction({
                            actionName: 'Build',
                            input: sourceArtifact,
                            project: devicefarmProject,
                            outputs: [buildArtifact],
                        }),
                    ],
                },
                {
                    stageName: 'Deploy',
                    actions: [
                        new codepipeline_actions.S3DeployAction({
                            actionName: "Deploy",
                            input: buildArtifact,
                            bucket: new s3.Bucket(this, 'buildBucket'),

                        }),
                    ],
                }
            ]
        });

        const topic = new sns.Topic(this, `topic`);
        new CodePipelineNotification(this, `notification`, {
            topic: topic,
            pipeline: pipeline,
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
