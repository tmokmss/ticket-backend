import { Construct, Stage, StageProps } from "@aws-cdk/core";
import { TicketServiceStack } from "../stack/ticket-service";

export class TravelStage extends Stage {
    constructor(scope: Construct, id: string, props?: StageProps) {
        super(scope, id, props);

        const prefix = 'Octank'

        const ticket = new TicketServiceStack(this, prefix + 'TicketServiceStack');
    }
}