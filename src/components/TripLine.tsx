import { CircleMarker, Polyline, Tooltip } from 'react-leaflet';
import { type Stop, type Trip } from '../services/api';
import { useState, useEffect } from 'react';

function TripLine({ trip }: { trip: Trip }) {

    const [positions, setPositions] = useState<[number, number][]>([]);
    const [stops, setStops] = useState<Stop[]>([]);

    useEffect(() => {
        const { positions, stops } = trip.polyline.features.reduce((acc, feature) => {
            const [lng, lat] = feature.geometry.coordinates;
            if (lat != null && lng != null) {
                acc.positions.push([lat, lng]);
            }

            const stop = feature.properties;
            if (stop?.location?.latitude != null && stop.location.longitude != null) {
                // use coordinates of the point on the line not the coordinates from the station
                // so that the station marker will appear directly on the polyline
                stop.location.latitude = lat;
                stop.location.longitude = lng;
                if (!acc.seenStopIds.has(stop.id)) {
                    acc.seenStopIds.add(stop.id);
                    acc.stops.push(stop);
                }
            }

            return acc;
        }, {
            positions: [] as [number, number][],
            stops: [] as Stop[],
            seenStopIds: new Set<Stop['id']>(),
        });
        setPositions(positions);
        setStops(stops);
    }, [trip]);

    if (positions.length === 0) {
        return null;
    }

    return (
        <>
            <Polyline positions={positions} pathOptions={{ weight: 8, color: '#009154' }} />
            {stops.map((stop) => (
                <CircleMarker
                    key={stop.id}
                    center={[stop.location.latitude, stop.location.longitude]}
                    radius={7}
                    pathOptions={{ weight: 4, color: '#009154', fillColor: '#fff', fillOpacity: 1 }}
                >
                    <Tooltip direction="top" offset={[0, -6]}>{stop.name}</Tooltip>
                </CircleMarker>
            ))}
        </>
    )
}

export default TripLine;
