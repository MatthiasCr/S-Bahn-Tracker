import 'leaflet/dist/leaflet.css';
import '../css/Map.css';
import { MapContainer, TileLayer, LayerGroup, useMap } from 'react-leaflet';
import { type Movement, type Trip, radar, trip } from '../services/api'
import { useState, useEffect } from 'react';
import Vehicle from './Vehicle';
import TripLine from './TripLine';

function Map() {
    return (
        <MapContainer
            center={[52.517275, 13.381406]}
            zoom={15}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
        >
            <MapLayers />
        </MapContainer>
    );
}
export default Map;


function MapLayers() {

    const leafletMap = useMap();
    const [movements, setMovements] = useState<Movement[]>([]);
    const [activeTrip, setActiveTrip] = useState<Trip | null>(null);

    useEffect(() => {
        let isMounted = true;
        let intervalId: ReturnType<typeof setInterval> | null = null;

        const fetchRadar = async () => {
            if (!isMounted) return;

            const size = leafletMap.getSize();
            if (size.x === 0 || size.y === 0) {
                leafletMap.invalidateSize();
                return;
            }

            const bounds = leafletMap.getBounds();

            try {
                const data = await radar(bounds);
                if (isMounted) {
                    setMovements(data);
                }
            } catch (error) {
                setMovements([]);
                console.error('Unable to load radar', error);
            }
        };

        const startPolling = () => {
            fetchRadar();
            intervalId = setInterval(fetchRadar, 20000); // 20s
        };

        leafletMap.whenReady(startPolling);

        return () => {
            isMounted = false;
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [leafletMap]);


    const onVehicleClick = async (tripId: string) => {
        const t = await trip(tripId);
        setActiveTrip(t);
        console.log(t);
    }

    return (
        <div className="map-container">
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
                    return <Vehicle movement={mov} onVehicleClick={onVehicleClick} key={mov.tripId} />
                })}
            </LayerGroup>

            {activeTrip != null && <TripLine trip={activeTrip} />}

        </div>
    );
}
