import { Request, Response } from "express";
import { Travel } from "../model/travel";

export async function getTravels(req: Request, res: Response) {
    const travels = [
        new Travel({departure: '羽田', destination: '那覇'}),
        new Travel({departure: '羽田', destination: '福岡'}),
        new Travel({departure: '羽田', destination: '広島'}),
        new Travel({departure: '羽田', destination: '大阪'}),
        new Travel({departure: '羽田', destination: '仙台'}),
        new Travel({departure: '成田', destination: '那覇'}),
        new Travel({departure: '成田', destination: '福岡'}),
        new Travel({departure: '成田', destination: '広島'}),
        new Travel({departure: '成田', destination: '大阪'}),
        new Travel({departure: '成田', destination: '仙台'}),
    ];

    res.type('json');
    res.send(JSON.stringify(travels));
}
