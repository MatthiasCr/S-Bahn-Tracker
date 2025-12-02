import type { LatLngBounds } from "leaflet";

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
    // arrival, departure, delay ...    
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
    stopovers: Stopover[],
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
        frames: "1",
        suburban: "true",
        subway: "false",
        regional: "false"
    });

    const response = await fetch(`/api/radar?${params.toString()}`);
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
        tripId: tripId
    });

    const response = await fetch(`/api/trip?${params.toString()}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch radar: ${response.status}`);
    }
    const data = await response.json();
    return data.trip;
}