import '../css/DetailPane.css';
import { type Trip } from '../services/api';
import sBahnIconUrl from '../assets/s-bahn.svg';

function DetailPane({ trip, onClose }: { trip: Trip, onClose: () => void }) {
    return (
        <div className="detail-pane">
            <div className="detail-pane-content">
                <div className="detail-pane-header">
                    <div className="detail-pane-title">
                        <img className="line-logo" src={sBahnIconUrl} alt="S-Bahn logo" />
                        <div>{trip.line.name}</div>
                    </div>
                    <button
                        className="detail-pane-close-button"
                        onClick={onClose}
                        type="button"
                        aria-label="Close details"
                    >
                        ×
                    </button>
                </div>
                <div>{trip.direction}</div>
            </div>
        </div>
    )
}

export default DetailPane;
