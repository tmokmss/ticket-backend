import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import { Construct, SecretValue, Stack, StackProps } from '@aws-cdk/core';
import { CdkPipeline, SimpleSynthAction } from "@aws-cdk/pipelines";
import { TravelStage } from '../stage/travel';
import { TicketServiceStack } from './ticket-service';

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

      pipeline.addApplicationStage(new TravelStage(this, `travel-stage`))
    }
  }