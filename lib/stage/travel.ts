import { Construct, Stage, StageProps } from "@aws-cdk/core";
import { StorageStack } from "../stack/storage";
import { TicketServiceStack } from "../stack/ticket-service";

export class TravelStage extends Stage {
    constructor(scope: Construct, id: string, props?: StageProps) {
        super(scope, id, props);

        const ticket = new TicketServiceStack(this, 'TicketServiceStack');
        new StorageStack(this, StorageStack);
    }
}