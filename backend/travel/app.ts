import express from 'express';
import * as middleware from 'aws-serverless-express/middleware';
import * as travelController from "./controller/travel_controller";
import * as jwt from "jsonwebtoken";

export const app = express();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(middleware.eventContext());

{
    const router = express.Router();

    router.use((req, res, next) => {
        const token = req.headers.authorization!;
        const decoded = jwt.decode(token)!;
        req.body.userId = decoded.sub;
        next();
    })

    router.get('/', travelController.getTravels);
    app.use('/travels', router);
}
