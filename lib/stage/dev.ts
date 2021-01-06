import { Construct, Stage, StageProps } from "@aws-cdk/core";
import { CognitoStack } from "../stack/cognito";
import { StorageStack } from "../stack/storage";
import { TicketServiceStack } from "../stack/ticket-service";

export class DevStage extends Stage {
    constructor(scope: Construct, id: string, props?: StageProps) {
        super(scope, id, props);

        const cognito = new CognitoStack(this, 'CognitoStack');
        const storage = new StorageStack(this, 'StorageStack');
        const ticket = new TicketServiceStack(this, 'TicketServiceStack', {
            cognito,
            storage,
        });
    }
}