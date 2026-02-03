import type { LatLngBounds } from 'leaflet';
import { ANIMATION_TOTAL_DURATION_S, ANIMATION_FRAMES } from '../config/constants';

const API_KEY = import.meta.env.VITE_API_KEY as string | undefined;

export type Products = {
    suburban: boolean,
    subway: boolean,
    tram: boolean,
    bus: boolean,
    ferry: boolean,
    express: boolean,
    regional: boolean,
};

export type Location = {
    id: string,
    type: string,
    latitude: number,
    longitude: number,
};

export type Stop = {
    id: string,
    name: string,
    location: Location,
    products: Products,
};

export type Stopover = {
    stop: Stop,
    arrival: string,
    arrivalDelay: number,
    departure: string,
    departureDelay: number
};

export type Line = {
    type: string,
    id: string,
    fahrtnummer: string,
    name: string,
    productName: string,
    mode: string,
    product: string,
};

export type Trip = {
    id: string;
    origin: Stop,
    destination: Stop,
    direction: string,
    line: Line,
    departure: string,
    plannedDeparture: string,
    departureDelay: number,
    arrival: string,
    plannedArrival: string,
    stopovers?: Stopover[],
    polyline: {
        type: string,
        features: PolyLineFeature[]
    },
};

export type PolyLineFeature = {
    type: string,
    properties?: Stop,
    geometry: {
        type: string,
        coordinates: number[]
    },
};

export type Movement = {
    direction: string,
    tripId: string,
    line: {
        name: string,
        mode: string,
        product: string,
    },
    location: {
        type: string,
        latitude: number,
        longitude: number,
    },
    polyline: {
        type: string,
        features: PolyLineFeature[],
    },
};

type RadarResponse = {
    movements?: Movement[];
};

export const radar = async (bbox: LatLngBounds): Promise<Movement[]> => {

    const north = bbox.getNorth() ?? 52.52411;
    const east = bbox.getEast() ?? 13.41709;
    const south = bbox.getSouth() ?? 52.51942;
    const west = bbox.getWest() ?? 13.30002;

    const params = new URLSearchParams({
        north: north.toString(),
        west: west.toString(),
        south: south.toString(),
        east: east.toString(),
        results: "200",
        duration: ANIMATION_TOTAL_DURATION_S.toString(),
        frames: ANIMATION_FRAMES.toString(),
        suburban: "true",
        subway: "false",
        regional: "false"
    });

    const headers: HeadersInit = {};
    if (API_KEY) {
        headers['x-api-key'] = API_KEY;
    }

    const response = await fetch(`/api/radar?${params.toString()}`, { headers });
    if (!response.ok) {
        throw new Error(`Failed to fetch radar: ${response.status}`);
    }

    const data = await response.json() as RadarResponse;
    if (!Array.isArray(data.movements)) {
        return [];
    }
    return data.movements;
};

export const trip = async (tripId: string): Promise<Trip> => {
    const params = new URLSearchParams({
        tripId: tripId,
        stopovers: 'true',
    });

    const headers: HeadersInit = {};
    if (API_KEY) {
        headers['x-api-key'] = API_KEY;
    }

    const response = await fetch(`/api/trip?${params.toString()}`, { headers });
    if (!response.ok) {
        throw new Error(`Failed to fetch radar: ${response.status}`);
    }
    const data = await response.json();
    return data.trip;
}
