import { useEffect, useMemo, useRef, useState } from 'react';
import { Marker, CircleMarker, Tooltip, /*Polyline*/ } from 'react-leaflet';
import { Icon, type Marker as LeafletMarker, type CircleMarker as LeafletCircleMarker } from 'leaflet';
import { type Movement, type PolyLineFeature } from '../services/api'
import sBahnIconUrl from '../assets/s-bahn.svg';
import { useTicker } from '../contexts/TickerContext';
import { ANIMATION_TOTAL_DURATION_MS } from '../config/animation';

const vehicleIcon = new Icon({
    iconUrl: sBahnIconUrl,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
});

function Vehicle({ movement, onVehicleClick }: { movement: Movement, onVehicleClick: Function }) {

    // Mouseover
    const [focus, setFocus] = useState<boolean>(false);

    // Animmation
    const tickerNow = useTicker();
    const markerRef = useRef<LeafletMarker | null>(null);
    const circleRef = useRef<LeafletCircleMarker | null>(null);

    // Track when this vehicle's timeline starts so elapsed time is relative to
    // when the movement was received.
    const startTimeRef = useRef<number>(tickerNow);
    useEffect(() => {
        startTimeRef.current = performance.now();
    }, [movement]); // reset timeline when new movement arrives


    // Precompute static geometry derived from the movement so that per-frame work is minimized
    // This is executed once after the movement is received
    const geometry = useMemo(() => {
        const coords: [number, number][] = [];
        const feats: PolyLineFeature[] = movement.polyline.features;

        for (const feat of feats) {
            const [lng, lat] = feat.geometry.coordinates;
            if (lat != null && lng != null) {
                coords.push([lat, lng]);
            }
        }

        const totalDurationMs = ANIMATION_TOTAL_DURATION_MS;
        const segmentCount = Math.max(coords.length - 1, 0);
        const segmentDuration = segmentCount > 0 ? totalDurationMs / segmentCount : 0;

        const segs = [];
        for (let i = 0; i < segmentCount; i++) {
            const [startLat, startLng] = coords[i];
            const [endLat, endLng] = coords[i + 1];
            segs.push({
                startLat,
                startLng,
                endLat,
                endLng,
                duration: segmentDuration,
                startTime: i * segmentDuration,
                endTime: (i + 1) * segmentDuration,
                deltaLat: endLat - startLat,
                deltaLng: endLng - startLng,
            });
        }

        return { positions: coords, segments: segs, segmentDuration, totalDurationMs };
    }, [movement]);
    const { /*positions,*/ segments, segmentDuration, totalDurationMs } = geometry;



    // Per-Frame (!) interpolation of position
    const animatedPosition = useMemo<[number, number]>(() => {
        if (segments.length === 0) {
            // Fallback to current reported location if we have no geometry.
            return [movement.location.latitude, movement.location.longitude];
        }

        const elapsed = Math.max(0, tickerNow - startTimeRef.current);

        // If we've run through the full timeline, clamp to the final checkpoint.
        if (elapsed >= totalDurationMs) {
            const last = segments[segments.length - 1];

            return [last.endLat, last.endLng];
        }

        const segIndex = Math.min(Math.floor(elapsed / segmentDuration), segments.length - 1);
        const seg = segments[segIndex];
        const segElapsed = elapsed - seg.startTime;
        const t = seg.duration > 0 ? Math.min(segElapsed / seg.duration, 1) : 1;

        const lat = seg.startLat + seg.deltaLat * t;
        const lng = seg.startLng + seg.deltaLng * t;

        return [lat, lng];

    }, [movement.location.latitude, movement.location.longitude, segments, segmentDuration, totalDurationMs, tickerNow]);

    // Imperatively move the marker to avoid React work per frame.
    useEffect(() => {
        if (markerRef.current) {
            markerRef.current.setLatLng(animatedPosition);
        }
        if (circleRef.current) {
            circleRef.current.setLatLng(animatedPosition);
        }
    }, [animatedPosition]);


    return (
        <>
            {focus && (
                <CircleMarker
                    ref={circleRef}
                    center={animatedPosition}
                    radius={22}
                    pathOptions={{ color: '#009154', fillColor: '#009154', fillOpacity: 0.4, stroke: false }}
                    interactive={false}
                />
            )}
            <Marker
                ref={markerRef}
                position={animatedPosition}
                icon={vehicleIcon}
                eventHandlers={{
                    click: (_) => onVehicleClick(movement.tripId),
                    mouseover: (_) => setFocus(true),
                    mouseout: (_) => setFocus(false),
                }}
            >
                <Tooltip
                    direction="bottom"
                    offset={[0, 10]}>{movement.line.name}
                    {movement.direction.replace("(Berlin)", "")}
                </Tooltip>
            </Marker >
            {/* <Polyline
                positions={positions}
                pathOptions={{ weight: 8, color: '#000000ff' }}
            /> */}

        </>
    )
}

export default Vehicle;
