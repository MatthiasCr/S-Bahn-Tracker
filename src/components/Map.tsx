import 'leaflet/dist/leaflet.css';
import '../css/Map.css';
import { MapContainer, TileLayer, LayerGroup, useMap } from 'react-leaflet';
import { type Movement, type Trip, radar, trip } from '../services/api'
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ANIMATION_TOTAL_DURATION_MS } from '../config/animation';
import Vehicle from './Vehicle';
import TripLine from './TripLine';
import DetailPane from './DetailPane';

function MyMap(
    {
        refreshKey,
        onMovementsChange
    }: {
        refreshKey: number,
        onMovementsChange: (count: number) => void
    }) {

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
export default MyMap;


function MapLayers(
    {
        refreshKey,
        onMovementsChange
    }: {
        refreshKey: number,
        onMovementsChange: (count: number) => void
    }) {

    const leafletMap = useMap();
    const [loading, setLoading] = useState<boolean>(false);

    type CachedMovement = { movement: Movement; expiresAt: number, isVisible: boolean };
    const [movements, setMovements] = useState<Map<string, CachedMovement>>(new Map());
    const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
    const radarCallInFlightRef = useRef<boolean>(false);

    const movementList = useMemo(() => (
        Array.from(movements.values())
    ), [movements]);

    const fetchRadar = useCallback(async () => {
        if (radarCallInFlightRef.current) {
            // prevent multiple concurrent api calls
            return;
        }
        radarCallInFlightRef.current = true;
        setLoading(true);

        const size = leafletMap.getSize();
        if (size.x === 0 || size.y === 0) {
            leafletMap.invalidateSize();
            radarCallInFlightRef.current = false;
            setLoading(false);
            return;
        }

        const bounds = leafletMap.getBounds();

        try {
            const data = await radar(bounds);

            console.log(data);
            const json = JSON.stringify(data);
            const bytes = new Blob([json]).size;
            console.log(`Size: ${(bytes / 1024).toFixed(2)} KB`);

            setMovements((prev) => {
                const now = performance.now();
                const next = new Map(prev);

                // Merge/update current radar results.
                data.forEach((mov) => {

                    const isVisible = bounds.contains([mov.location.latitude, mov.location.longitude]);

                    next.set(mov.tripId, {
                        movement: mov,
                        expiresAt: now + ANIMATION_TOTAL_DURATION_MS + 2000,
                        isVisible: isVisible
                    });
                });

                // Drop entries whose animation window has elapsed.
                for (const [tripId, entry] of next.entries()) {
                    if (entry.expiresAt <= now) {
                        next.delete(tripId);
                    }
                }

                onMovementsChange(next.size);
                return next;
            });
        } catch (error) {
            onMovementsChange(0);
            console.error('Unable to load radar', error);
        } finally {
            radarCallInFlightRef.current = false;
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
                {movementList.map((entry: CachedMovement) => {
                    return <Vehicle
                        movement={entry.movement}
                        onVehicleClick={onVehicleClick}
                        isVisible={entry.isVisible}
                        key={entry.movement.tripId}
                    />
                })}
            </LayerGroup>
            <LayerGroup>
                {activeTrip != null && <TripLine trip={activeTrip} />}
            </LayerGroup>
        </>
    );
}
