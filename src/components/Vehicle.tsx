import { useState } from 'react';
import { Marker, CircleMarker, Tooltip } from 'react-leaflet';
import { Icon } from 'leaflet';
import { type Movement } from '../services/api'
import sBahnIconUrl from '../assets/s-bahn.svg';

const vehicleIcon = new Icon({
    iconUrl: sBahnIconUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
});

function Vehicle({ movement, onVehicleClick }: { movement: Movement, onVehicleClick: Function }) {

    const [focus, setFocus] = useState<boolean>(false);

    return (
        <>
            {focus && (
                <CircleMarker
                    center={[movement.location.latitude, movement.location.longitude]}
                    radius={22}
                    pathOptions={{ color: '#009154', fillColor: '#009154', fillOpacity: 0.4, stroke: false }}
                    interactive={false}
                />
            )}
            <Marker
                position={[movement.location.latitude, movement.location.longitude]}
                icon={vehicleIcon}
                eventHandlers={{
                    click: (_) => {
                        onVehicleClick(movement.tripId)
                    },
                    mouseover: (_) => {
                        setFocus(true);
                    },
                    mouseout: (_) => {
                        setFocus(false);
                    },
                }}
            >
                <Tooltip direction="bottom" offset={[0, 10]}>{movement.line.name} {movement.direction}</Tooltip>
            </Marker >
        </>
    )
}

export default Vehicle;
