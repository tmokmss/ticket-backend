import express from 'express';
import * as middleware from 'aws-serverless-express/middleware'
import * as ticketController from "./controller/ticket_controller"

export const app = express();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(middleware.eventContext());

app.get('/getTest', (req: express.Request, res: express.Response) => {
    res.send(req.query)
});

app.post('/postTest', (req: express.Request, res: express.Response) => {
    res.send(req.body)
});

{
    const router = express.Router();
    router.get('/', ticketController.getTicket);
    router.post('/', ticketController.createTicket);
    router.put('/:ticketId', ticketController.createTicket);
    router.delete('/:ticketId', ticketController.createTicket);

    app.use('/tickets', router);
}