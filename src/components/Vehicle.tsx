import { Marker, Popup, Tooltip } from 'react-leaflet';
import { Icon } from 'leaflet';
import { type Movement } from '../services/api'
import sBahnIconUrl from '../assets/s-bahn.svg';

const vehicleIcon = new Icon({
    iconUrl: sBahnIconUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
});

function Vehicle({
    movement,
    onVehicleClick
}: {
    movement: Movement,
    onVehicleClick: Function
}) {
    return (
        <>
            <Marker
                position={[movement.location.latitude, movement.location.longitude]}
                icon={vehicleIcon}
                eventHandlers={{
                    click: (_) => {
                        onVehicleClick(movement.tripId)
                    },
                }}
            >
                <Tooltip direction="bottom" offset={[0, 10]}>{movement.line.name} {movement.direction}</Tooltip>
                {/* <Popup>{movement.line.name}<br />{movement.direction}</Popup> */}
            </Marker>
        </>
    )
}

export default Vehicle;
