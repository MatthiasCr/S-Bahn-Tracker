import { Polyline } from 'react-leaflet';
import { type Trip } from '../services/api'

function TripLine({ trip }: { trip: Trip }) {

    const positions = trip.polyline.features
        .map((feature) => {
            const [lng, lat] = feature.geometry.coordinates;
            if (lat == null || lng == null) return null;
            return [lat, lng] as [number, number];
        })
        .filter((coords): coords is [number, number] => coords !== null);

    if (positions.length === 0) {
        return null;
    }

    return (
        <>
            <Polyline positions={positions} pathOptions={{ weight: 8, color: '#009154' }} />
        </>
    )
}

export default TripLine;
