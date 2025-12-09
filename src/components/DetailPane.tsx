import '../css/DetailPane.css';
import { type Stopover, type Trip } from '../services/api';
import sBahnIconUrl from '../assets/s-bahn.svg';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

function DetailPane({ trip, onClose }: { trip: Trip, onClose: () => void }) {

    const map = useMap();

    useEffect(() => {
        // Make sure scroll wheel zoom is re-enabled if the pane is unmounted while hovered.
        return () => {
            map.scrollWheelZoom.enable();
        };
    }, [map]);

    return (
        <div
            className="detail-pane"
            onMouseEnter={() => map.scrollWheelZoom.disable()}
            onMouseLeave={() => map.scrollWheelZoom.enable()}
        >
            <div className="detail-pane-header">
                <div className="detail-pane-title">
                    <img className="line-logo" src={sBahnIconUrl} alt="S-Bahn logo" />
                    <div>{trip.line.name}</div>
                </div>
                <button
                    className="detail-pane-close-button fa-solid fa-xmark"
                    onClick={onClose}
                    type="button"
                    aria-label="Close details"
                />
            </div>
            <div className="direction">{trip.direction.replace("(Berlin)", "")}</div>
            <div
                className="stopovers-container"
                onWheelCapture={(event) => event.stopPropagation()}
            >
                {trip.stopovers && trip.stopovers.map((stopover) => (
                    <DetailPaneStopover key={stopover.stop.id} stopover={stopover} />
                ))}
            </div>
        </div>
    )
}

export default DetailPane;

function DetailPaneStopover({ stopover }: { stopover: Stopover }) {

    const stopoverName = stopover.stop.name.replace("(Berlin)", "");

    // const stopoverName = stopover.stop.name;
    return <div className="stopover">
        {stopoverName}
    </div>
}
