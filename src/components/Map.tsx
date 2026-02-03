import 'leaflet/dist/leaflet.css';
import '../css/Map.css';
import { MapContainer, TileLayer, LayerGroup, useMap } from 'react-leaflet';
import { type Movement, type Trip, radar, trip } from '../services/api'
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ANIMATION_TOTAL_DURATION_MS, RADAR_BASE_DEBOUNCE_MS, RADAR_MIN_GAP_MS, RADAR_MOVE_MIN_DIST_M } from '../config/constants';
import Vehicle from './Vehicle';
import TripLine from './TripLine';
import DetailPane from './DetailPane';
import type { LatLng } from 'leaflet';

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
    const moveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mapCenterRef = useRef<LatLng>(leafletMap.getCenter());
    const lastFetchTimeRef = useRef<number>(0);

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
        const center = bounds.getCenter();
        lastFetchTimeRef.current = performance.now();

        try {
            const data = await radar(bounds);

            console.log(data);
            const json = JSON.stringify(data);
            const bytes = new Blob([json]).size;
            console.log(`Size: ${(bytes / 1024).toFixed(2)} KB`);

            setMovements((prev) => {
                const now = performance.now();
                const next = new Map(prev);
                mapCenterRef.current = center;

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

    //
    // auto-refresh after animation interval is finished
    //
    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval> | null = null;

        const startPolling = () => {
            // new fetch at least every time a full animation timeline finished
            intervalId = setInterval(fetchRadar, ANIMATION_TOTAL_DURATION_MS);
        };

        leafletMap.whenReady(startPolling);

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [leafletMap, fetchRadar]);

    //
    // auto-refresh on moveend/zoomend 
    //
    useEffect(() => {
        const handleMove = () => {
            const bounds = leafletMap.getBounds();
            const center = bounds.getCenter();
            const lastCenter = mapCenterRef.current;

            // Update visibility flags for cached movements.
            setMovements((prev) => {
                const next = new Map(prev);
                for (const [tripId, entry] of next.entries()) {
                    const isVisible = bounds.contains([entry.movement.location.latitude, entry.movement.location.longitude]);
                    next.set(tripId, { ...entry, isVisible });
                }
                return next;
            });

            // Distance guard: only proceed if moved > 500m since last fetch.
            const distMeters = leafletMap.distance(center, lastCenter);
            if (distMeters < RADAR_MOVE_MIN_DIST_M) {
                return;
            }

            // Debounce radar fetch.
            if (moveDebounceRef.current) {
                clearTimeout(moveDebounceRef.current);
            }
            moveDebounceRef.current = setTimeout(() => {
                fetchRadar();
            }, (() => {
                // calculate debounce time
                const baseDelay = RADAR_BASE_DEBOUNCE_MS;
                const minGap = RADAR_MIN_GAP_MS; // min ms between fetches (as a rate limiting)
                const sinceLast = performance.now() - lastFetchTimeRef.current;
                const extra = sinceLast >= minGap ? 0 : (minGap - sinceLast);
                return baseDelay + extra;
            })());
        };

        leafletMap.on('moveend', handleMove);
        leafletMap.on('zoomend', handleMove);

        return () => {
            leafletMap.off('moveend', handleMove);
            leafletMap.off('zoomend', handleMove);
            if (moveDebounceRef.current) {
                clearTimeout(moveDebounceRef.current);
            }
        };
    }, [leafletMap, fetchRadar]);

    // manual refresh using button
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
