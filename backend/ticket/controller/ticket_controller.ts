import { Request, Response } from "express";
import { Ticket } from "../model/ticket";

export async function createTicket(req: Request, res: Response) {
    const travelId = req.body.travelId;

    try {
        const response = await Ticket.create(getUserId(), travelId);
        res.send(response);
    } catch (e) {
        console.log(e);
        res.send(e);
    }
}

export async function getTickets(req: Request, res: Response) {
    try {
        const response = await Ticket.query(getUserId());
        res.send(response);
    } catch (e) {
        console.log(e);
        res.send(e);
    }
}

function getUserId() {
    return "test";
}