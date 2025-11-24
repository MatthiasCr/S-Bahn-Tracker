const BASE_URL = 'https://v6.vbb.transport.rest';


export type Station = {
    id: string,
    name: string,
    location?: {
        latitude: number;
        longitude: number;
    };
};


type NearestStationsResponse = Station[];

export const getNearestStations = async (
    latitude: number,
    longitude: number,
    numberOfStations: number,
): Promise<NearestStationsResponse> => {
    const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        results: numberOfStations.toString(),
        stops: 'true',
        poi: 'false',
        linesOfStops: 'false',
        language: 'en',
    });

    const response = await fetch(`${BASE_URL}/locations/nearby?${params.toString()}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch nearest stations: ${response.status}`);
    }
    return response.json() as Promise<NearestStationsResponse>;
};

type ShapeRespnse = [][];

export const getShape = async (): Promise<ShapeRespnse> => {

    const response = await fetch(`${BASE_URL}/shapes/392`);
    if (!response.ok) {
        throw new Error(`Failed to fetch shape: ${response.status}`);
    }
    return response.json() as Promise<ShapeRespnse>;
};

export type Trip = {
    id: string;
    name: string;
    currentLocation: {
        latitude: number;
        longitude: number;
    },
    origin: Station,
    destination: Station,
    line: {
        type: string,
        id: string,
        fahrtnummer: string,
        name: string,
        color: {
            fg: string,
            bg: string,
        }
    },
    direction: string
};

export const getCurrentTrips = async () => {
    const params = new URLSearchParams({
        query: '*',
        onlyCurrentlyRunning: 'true',
        // lineName: '',
        product: 'suburban',
        operatorNames: 'S-Bahn Berlin GmbH',
        stopovers: 'false',
        language: 'en',
    });

    const response = await fetch(`${BASE_URL}/trips?${params.toString()}`);
    const data = await response.json();
    console.log(data);
    return data;
}

export type Movement = {
    direction: string;
    trip_id: string;
    line: {
        name: string;
        mode: string;
        product: string;
    },
    location: {
        type: string;
        latitude: number;
        longitude: number;
    },
    polyline: {
        type: string;
        features: {
            geometry: {
                coordinates: number[];
            };
        }[];
    };
};

export const radar = async (): Promise<Movement[]> => {

    const params = new URLSearchParams({
        north: "52.52411",
        west: "13.30002",
        south: "52.51942",
        east: "13.41709",
        results: "10"
    });

    const response = await fetch(`/api/radar${params.toString()}`);
    const data = await response.json();

    console.log(data);
    return data.movements as Movement[];
};
