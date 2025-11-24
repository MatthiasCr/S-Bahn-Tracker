import 'leaflet/dist/leaflet.css';
import '../css/Map.css';
import { MapContainer, TileLayer, LayerGroup } from 'react-leaflet';
import { type Movement, radar } from '../services/api'
import { useState, useEffect } from 'react';
import Vehicle from './Vehicle';

function Map() {
    const [movements, setMovements] = useState<Movement[]>([]);

    useEffect(() => {
        const fetchRadar = async () => {
            try {
                const data = await radar();
                setMovements(data);
            } catch (error) {
                console.error('Unable to load radar', error);
            }
        };
        fetchRadar();
    }, []);

    return (
        <div className="map-container">
            <MapContainer center={[52.517275, 13.381406]} zoom={15} scrollWheelZoom={true}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* {stations.map((station) => {
                    if (!station.location) return null;

                    return (
                        <Marker
                            key={station.id}
                            position={[station.location.latitude, station.location.longitude]}
                        >
                            <Popup>{station.name}</Popup>
                        </Marker>
                    );
                })} */}

                <LayerGroup>
                    {movements.map((mov) => {
                        return <Vehicle movement={mov} key={mov.tripId} />
                    })}
                </LayerGroup>

                {/* <Polyline pathOptions={blackOptions} positions={shape} /> */}
            </MapContainer>

        </div>
    );
}

export default Map;
