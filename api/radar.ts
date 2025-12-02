// Vercel Node function
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from 'hafas-client'
import { profile as bvgProfile } from 'hafas-client/p/bvg/index.js'

const userAgent = 's-bahn-tracker'
const client = createClient(bvgProfile, userAgent)

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const apiKey = process.env.API_KEY;
        const providedKey = Array.isArray(req.headers['x-api-key']) ? req.headers['x-api-key'][0] : req.headers['x-api-key'];

        if (!apiKey || providedKey !== apiKey) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const {
            north = "52.52411",
            west = "13.30002",
            south = "52.51942",
            east = "13.41709",
            results = "5",
            duration = "30",
            frames = "1",
            polylines = "true",
            subStops = "false",
            entrances = "false",
            suburban = "true",
            subway = "false",
            regional = "false"
        } = req.query;

        const bbox = {
            north: parseFloat(north as string),
            west: parseFloat(west as string),
            south: parseFloat(south as string),
            east: parseFloat(east as string),
        };

        const opt = {
            results: parseInt(results as string, 10),
            duration: parseFloat(duration as string),
            frames: parseInt(frames as string),
            polylines: JSON.parse(polylines as string),
            subStops: JSON.parse(subStops as string),
            entrances: JSON.parse(entrances as string),
            products: {
                suburban: JSON.parse(suburban as string),
                subway: JSON.parse(subway as string),
                bus: false,
                ferry: false,
                regional: JSON.parse(regional as string),
                tram: false,
                express: false,
            },
        }

        const data = await client.radar(bbox, opt);
        return res.status(200).json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
    }
}
