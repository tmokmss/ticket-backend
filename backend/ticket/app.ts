import express from 'express';
import * as middleware from 'aws-serverless-express/middleware'

export const app = express();
const router = express.Router();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
router.use(middleware.eventContext());

router.get('/api/getTest', (req: express.Request, res: express.Response) => {
    res.send(req.query)
});

router.post('/api/postTest', (req: express.Request, res: express.Response) => {
    res.send(req.body)
});

app.use('/tickets', router);
