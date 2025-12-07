import '../css/Navbar.css'
import sBahnIconUrl from '../assets/s-bahn.svg';

function Navbar({ onRefresh, movementCount = 0 }: { onRefresh: () => void, movementCount: number }) {
    return (
        <>
            <nav className="navbar">
                <div className="navbar-left">
                    <img className="navbar-logo" src={sBahnIconUrl} alt="S-Bahn logo" />
                    <div className="navbar-brand">
                        S-Bahn Tracker
                    </div>
                </div>
                <div className="navbar-right">
                    <div className="navbar-count" aria-label="Movement count">
                        Rendering {movementCount} Vehicles
                    </div>
                    <button className="navbar-refresh" onClick={onRefresh}>
                        Refresh
                    </button>
                </div>
            </nav>
        </>
    )
}

export default Navbar;
