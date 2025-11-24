import { Circle, Popup } from 'react-leaflet';
import { type Movement } from '../services/api'

function Vehicle({ movement }: { movement: Movement }) {
    return (
        <>
            <Circle
                center={[movement.location.latitude, movement.location.longitude]}
                radius={150}
            >
                <Popup>{movement.line.name}<br />{movement.direction}</Popup>
            </Circle>
        </>
    )
}

export default Vehicle;
