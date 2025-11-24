// Vercel Node function
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from 'hafas-client'
import { profile as bvgProfile } from 'hafas-client/p/bvg/index.js'

const userAgent = 'matthias.cram@gmail.com'
const client = createClient(bvgProfile, userAgent)

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {

        const {
            north,
            west,
            south,
            east,
            results = "5",
        } = req.query;

        const bbox = {
            north: parseFloat(north as string),
            west: parseFloat(west as string),
            south: parseFloat(south as string),
            east: parseFloat(east as string),
        };

        const opt = {
            results: parseInt(results as string, 10),
            products: {
                suburban: true,
                subway: false,
                bus: false,
                ferry: false,
                regional: false,
                tram: false,
                express: false,
            },
        }

        const data = await client.radar(bbox, opt);

        return res.status(200).json(data);
    } catch (err) {
        console.error(err);
        return res.status(500);
    }
}