import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codebuild from '@aws-cdk/aws-codebuild';
import * as sns from '@aws-cdk/aws-sns';
import * as s3 from '@aws-cdk/aws-s3';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import { App, Construct, SecretValue, Stack, StackProps } from '@aws-cdk/core';
import { CodePipelineNotification } from '../construct/codepipeline-notification';
import { DeviceFarmAction, AppType, TestType } from '../construct/devicefarm-action';

export class CicdMobileStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const sourceArtifact = new codepipeline.Artifact();
        const buildArtifact = new codepipeline.Artifact();

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
                            project: new codebuild.PipelineProject(this, 'apk-project', {
                                environment: {
                                    buildImage: codebuild.LinuxBuildImage.STANDARD_4_0,
                                    computeType: codebuild.ComputeType.SMALL,
                                },
                            }),
                            outputs: [buildArtifact],
                        }),
                    ],
                },
                {
                    stageName: 'Test-apk',
                    actions: [
                        new DeviceFarmAction({
                            actionName: 'Test',
                            input: buildArtifact,
                            appType: AppType.ANDROID,
                            testType: TestType.BUILTIN_FUZZ,
                            projectId: "87aa9613-de9f-47fe-b8df-a359659ced05",
                            // Get devicePoolArn by executing: aws devicefarm list-device-pools --arn arn:aws:devicefarm:us-west-2:198634196645:project:87aa9613-de9f-47fe-b8df-a359659ced05 --region us-west-2
                            devicePoolArn: "arn:aws:devicefarm:us-west-2:198634196645:devicepool:87aa9613-de9f-47fe-b8df-a359659ced05/ea3114d0-fbdd-458a-b5e0-15a875b38e32",
                            app: "app-release.apk",
                            test: "test-spec.yml",
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
    }
}