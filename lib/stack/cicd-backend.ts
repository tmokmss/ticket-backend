import * as sns from "@aws-cdk/aws-sns";
import * as sub from "@aws-cdk/aws-sns-subscriptions";
import * as lambdanode from "@aws-cdk/aws-lambda-nodejs";
import * as codebuild from "@aws-cdk/aws-codebuild";
import { Construct, SecretValue, Stack, StackProps } from "@aws-cdk/core";
import { DevStage } from "../stage/dev";
import { CodePipelineNotification } from "../construct/codepipeline-notification";
import * as pipelines from "@aws-cdk/pipelines";

export class CicdBackendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const source = pipelines.CodePipelineSource.gitHub(
      `tmokmss/ticket-backend`,
      "main",
      {
        authentication: SecretValue.secretsManager("github-token"),
      }
    );

    const pipeline = new pipelines.CodePipeline(this, "Pipeline", {
      pipelineName: "OctankTravelBackend",
      selfMutation: false,
      synth: new pipelines.ShellStep("Synth", {
        input: source,
        commands: ["npm ci", "npm run build", "npx cdk synth"],
      }),
    });

    const testStep = new pipelines.CodeBuildStep(`TestStep`, {
    //   partialBuildSpec: codebuild.BuildSpec.fromSourceFilename(
    //     "backend/ticket/buildspec.yml"
    //   ),
      buildEnvironment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_4_0,
        computeType: codebuild.ComputeType.SMALL,
        privileged: true,
      },
      commands: [
        "npm run test",
      ],
      installCommands: [
        "docker run -d -p 8000:8000 public.ecr.aws/mobileup/dynamodb-local",
        "cd backend/ticket",
        "npm ci",
        "npm run build",
      ],
      input: source,
    });

    pipeline.addStage(new DevStage(this, `dev-stage`), {
        pre: [testStep],
    });

    pipeline.buildPipeline();

    const topic = new sns.Topic(this, `topic`);
    new CodePipelineNotification(this, `notification`, {
      topic: topic,
      pipeline: pipeline.pipeline,
    });

    const slackNotifier = new lambdanode.NodejsFunction(
      this,
      "slack-notifier",
      {
        entry: "backend/slack-notify/main.ts",
        handler: "lambdaHandler",
        depsLockFilePath: "backend/slack-notify/package-lock.json",
        bundling: {
          minify: false,
          nodeModules: ["axios"],
        },
        environment: {
          SLACK_WEBHOOK_URL:
            SecretValue.secretsManager("slack-webhook-url").toString(),
        },
      }
    );

    topic.addSubscription(new sub.LambdaSubscription(slackNotifier));
  }
}
