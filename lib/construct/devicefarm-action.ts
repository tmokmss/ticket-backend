import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as iam from '@aws-cdk/aws-iam';
import { Construct } from '@aws-cdk/core';

export enum AppType {
    IOS = 'iOS',
    ANDROID = 'Android',
    WEB = 'Web',
}

export enum TestType {
    APPIUM_JAVA_JUNIT = 'APPIUM_JAVA_JUNIT',
    APPIUM_JAVA_TESTNG = 'APPIUM_JAVA_TESTNG',
    APPIUM_PYTHON = 'APPIUM_PYTHON',
    APPIUM_WEB_JAVA_JUNIT = 'APPIUM_WEB_JAVA_JUNIT',
    APPIUM_WEB_JAVA_TESTNG = 'APPIUM_WEB_JAVA_TESTNG',
    APPIUM_WEB_PYTHON = 'APPIUM_WEB_PYTHON',
    BUILTIN_EXPLORER = 'BUILTIN_EXPLORER',
    BUILTIN_FUZZ = 'BUILTIN_FUZZ',
    CALABASH = 'CALABASH',
    INSTRUMENTATION = 'INSTRUMENTATION',
    UIAUTOMATION = 'UIAUTOMATION',
    UIAUTOMATOR = 'UIAUTOMATOR',
    WEB_PERFORMANCE_PROFILE = 'WEB_PERFORMANCE_PROFILE',
    XCTEST = 'XCTEST',
    XCTEST_UI = 'XCTEST_UI',
}

// refer to https://docs.aws.amazon.com/codepipeline/latest/userguide/action-reference-DeviceFarm.html
interface DeviceFarmActionProps extends codepipeline.CommonAwsActionProps {
    input: codepipeline.Artifact,
    appType: AppType,

    // The Device Farm project ID.
    projectId: string,

    // The name and location of the application file in your input artifact. For example: s3-ios-test-1.ipa
    app: string,

    // The Device Farm device pool ARN.
    devicePoolArn: string,

    appiumVersion?: string,

    testType: TestType,

    // The name and path of the test definition file in your source location. 
    // The path is relative to the root of the input artifact for your test.
    test?: string,

    additionalData?: string,
}

export class DeviceFarmAction extends codepipeline_actions.Action {
    private readonly props: DeviceFarmActionProps;

    constructor(props: DeviceFarmActionProps) {
        super({
            ...props,
            category: codepipeline.ActionCategory.TEST,
            provider: 'DeviceFarm',
            artifactBounds: {
                minInputs: 1,
                maxInputs: 1,
                minOutputs: 0,
                maxOutputs: 0
            },
            inputs: [props.input],
        });

        this.props = props;
    }

    protected bound(scope: Construct, _stage: codepipeline.IStage, options: codepipeline.ActionBindOptions): codepipeline.ActionConfig {
        options.role.addToPrincipalPolicy(
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
            }));


        if ((this.actionProperties.inputs || []).length > 0) {
            options.bucket.grantRead(options.role);
        }

        return {
            configuration: {
                AppType: this.props.appType,
                ProjectId: this.props.projectId,
                App: this.props.app,
                DevicePoolArn: this.props.devicePoolArn,
                TestType: this.props.testType,
                Test: this.props.test,
                AdditionalData: this.props.additionalData,
            },
        };
    }
}

// aws devicefarm list-device-pools --arn arn:aws:devicefarm:us-west-2:198634196645:project:87aa9613-de9f-47fe-b8df-a359659ced05
