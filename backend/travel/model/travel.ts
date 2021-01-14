interface TravelProps {
    destination: string,
    departure: string,
}

export class Travel {
    readonly destination: string;
    readonly departure: string;

    constructor(props: TravelProps) {
        this.destination = props.destination;
        this.departure = props.departure;
    }

    travelId(): string{
        return `${this.departure}-${this.destination}`;
    }

    toJSON() {
        return {
            departure: this.departure,
            destination: this.destination,
            travelId: this.travelId(),
        }
    }
}
