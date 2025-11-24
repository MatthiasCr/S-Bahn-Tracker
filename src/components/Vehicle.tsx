import { Circle, Popup } from 'react-leaflet';
import { type Trip, type Movement } from '../services/api'

function Vehicle({ trip }: { trip: Movement }) {
    return (
        <>
            <Circle
                key={trip.trip_id}
                center={[trip.location.latitude, trip.location.longitude]}
                // pathOptions={{ color:  }}
                radius={150}
            >{trip.line.name}
                <Popup>{trip.line.name}<br />{trip.direction}</Popup>
            </Circle>
        </>
    )
}

export default Vehicle;