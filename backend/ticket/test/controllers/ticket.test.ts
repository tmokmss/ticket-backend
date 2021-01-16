import { app } from "../../app";
import * as request from "supertest";
import { createIdToken } from "../../util/token";
import { Ticket, TicketProps } from "../../model/ticket";
import { finalizeDynamoDB, initializeDynamoDB } from "../utils/initialize_db";

beforeAll(async () => {
    await initializeDynamoDB();
});

afterAll(async () => {
    await finalizeDynamoDB();
});

const userId = 'hoge';
const travelId = 'fuga';

test('create', async () => {
    const response = await request.agent(app)
        .post("/tickets")
        .set({ Authorization: createIdToken(userId) })
        .send({ travelId: travelId });

    expect(response.status).toBe(200);
    const tickets = await Ticket.query(userId);
    expect(tickets.find(t => t.userId == userId && t.travelId == travelId)).toBeTruthy();
});

test('get', async () => {
    const response = await request.agent(app)
        .get("/tickets")
        .set({ Authorization: createIdToken(userId) });

    expect(response.status).toBe(200);
    expect(response.body.find((t: TicketProps) => t.userId == userId && t.travelId == travelId)).toBeTruthy();
});

test('cancel', async () => {
    const tickets = await Ticket.query(userId);
    expect(tickets.find(t => t.userId == userId && t.travelId == travelId)).toBeTruthy();


    const response = await request.agent(app)
        .post("/tickets/cancel")
        .set({ Authorization: createIdToken(userId) })
        .send({ travelId: travelId });

    expect(response.status).toBe(200);
    const ticketsAfter = await Ticket.query(userId);
    expect(ticketsAfter.find(t => t.userId == userId && t.travelId == travelId)).toBeFalsy();
});
