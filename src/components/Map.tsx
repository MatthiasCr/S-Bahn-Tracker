import 'leaflet/dist/leaflet.css';
import '../css/Map.css';
import { MapContainer, TileLayer, LayerGroup, useMap } from 'react-leaflet';
import { type Movement, type Trip, radar, trip } from '../services/api'
import { useState, useEffect, useCallback } from 'react';
import Vehicle from './Vehicle';
import TripLine from './TripLine';
import DetailPane from './DetailPane';

function Map({ refreshKey, onMovementsChange }: { refreshKey: number, onMovementsChange: (count: number) => void }) {
    return (
        <MapContainer
            className="map-container"
            center={[52.517275, 13.381406]}
            zoom={15}
            scrollWheelZoom={true}
            zoomControl={false}
        >
            <MapLayers refreshKey={refreshKey} onMovementsChange={onMovementsChange} />
        </MapContainer>
    );
}
export default Map;


function MapLayers({ refreshKey, onMovementsChange }: { refreshKey: number, onMovementsChange: (count: number) => void }) {

    const leafletMap = useMap();
    const [loading, setLoading] = useState<boolean>(false);

    const [movements, setMovements] = useState<Movement[]>([]);
    const [activeTrip, setActiveTrip] = useState<Trip | null>(null);

    const fetchRadar = useCallback(async () => {
        setLoading(true);

        const size = leafletMap.getSize();
        if (size.x === 0 || size.y === 0) {
            leafletMap.invalidateSize();
            setLoading(false);
            return;
        }

        const bounds = leafletMap.getBounds();

        try {
            const data = await radar(bounds);

            // console.log(data);

            // const json = JSON.stringify(data);
            // const bytes = new Blob([json]).size;
            // console.log(`Size: ${(bytes / 1024).toFixed(2)} KB`);

            setMovements(data);
            onMovementsChange(data.length);
        } catch (error) {
            setMovements([]);
            onMovementsChange(0);
            console.error('Unable to load radar', error);
        } finally {
            setLoading(false);
        }
    }, [leafletMap, onMovementsChange]);

    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval> | null = null;

        const startPolling = () => {
            intervalId = setInterval(fetchRadar, 60000); // 60s
        };

        leafletMap.whenReady(startPolling);

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [leafletMap, fetchRadar]);

    useEffect(() => {
        fetchRadar();
    }, [refreshKey, fetchRadar]);


    const onVehicleClick = async (tripId: string) => {
        setLoading(true);
        try {
            const t = await trip(tripId);
            setActiveTrip(t);
        } catch (error) {
            setActiveTrip(null);
        } finally {
            setLoading(false);
        }
    }

    const onDetailPaneClose = () => {
        setActiveTrip(null);
    }

    return (
        <>
            {loading && <div className="map-loading">Loading...</div>}

            {activeTrip && <DetailPane trip={activeTrip} onClose={onDetailPaneClose} />}


            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LayerGroup>
                {movements.map((mov) => {
                    return <Vehicle movement={mov} onVehicleClick={onVehicleClick} key={mov.tripId} />
                })}
            </LayerGroup>
            <LayerGroup>
                {activeTrip != null && <TripLine trip={activeTrip} />}
            </LayerGroup>
        </>
    );
}
