import { SynthUtils } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import { CognitoStack } from "../lib/stack/cognito";
import { StorageStack } from "../lib/stack/storage";
import { TicketServiceStack } from "../lib/stack/ticket-service";
import { CicdBackendStack } from "../lib/stack/cicd-backend";

describe("Snapshot test", () => {
  test("cognito stack", () => {
    const app = new cdk.App();
    const stack = new CognitoStack(app, "Stack");
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
  });

  test("Storage stack", () => {
    const app = new cdk.App();
    const stack = new StorageStack(app, "Stack");
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
  });

  test("TicketService stack", () => {
    const app = new cdk.App();
    const cognito = new CognitoStack(app, "CognitoStack");
    const storage = new StorageStack(app, "StorageStack");
    const stack = new TicketServiceStack(app, "Stack", {
      cognito,
      storage,
    });
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
  });
});
