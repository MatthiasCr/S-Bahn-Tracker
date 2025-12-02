import '../css/Navbar.css'
import sBahnIconUrl from '../assets/s-bahn.svg';

function Navbar({ onRefresh }: { onRefresh?: () => void }) {
    return (
        <>
            <nav className="navbar">
                <div className="navbar-left">
                    <img className="navbar-logo" src={sBahnIconUrl} alt="S-Bahn logo" />
                    <div className="navbar-brand">
                        S-Bahn Tracker
                    </div>
                </div>
                {onRefresh && (
                    <button className="navbar-refresh" onClick={onRefresh}>
                        Refresh
                    </button>
                )}
            </nav>
        </>
    )
}

export default Navbar;
