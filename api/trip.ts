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
            tripId, // only required field
            stopovers = "false",
            polyline = "true",
            subStops = "false",
            entrances = "false",
            remarks = "false"
        } = req.query;

        const opt = {
            stopovers: JSON.parse(stopovers as string),
            polyline: JSON.parse(polyline as string),
            subStops: JSON.parse(subStops as string),
            entrances: JSON.parse(entrances as string),
            remarks: JSON.parse(remarks as string)
        }

        const data = await client.trip(tripId as string, opt);
        return res.status(200).json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error", details: (err as Error).message });
    }
}
