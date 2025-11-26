import { Circle, Popup } from 'react-leaflet';
import { type Movement } from '../services/api'

function Vehicle({
    movement,
    onVehicleClick
}: {
    movement: Movement,
    onVehicleClick: Function
}) {
    return (
        <>
            <Circle
                center={[movement.location.latitude, movement.location.longitude]}
                radius={150}
                eventHandlers={{
                    click: (_) => {
                        onVehicleClick(movement.tripId)
                    },
                }}
            >
                <Popup>{movement.line.name}<br />{movement.direction}</Popup>
            </Circle>
        </>
    )
}

export default Vehicle;
