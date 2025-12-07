import '../css/Navbar.css'
import sBahnIconUrl from '../assets/s-bahn.svg';
import { useState } from 'react';

function Navbar({ onRefresh, movementCount = 0 }: { onRefresh?: () => void, movementCount?: number }) {
    const [menuOpen, setMenuOpen] = useState(false);

    const handleRefreshClick = () => {
        onRefresh?.();
        setMenuOpen(false);
    };

    return (
        <div className="nav-container">
            <nav className="navbar">
                <div className="navbar-left">
                    <img className="navbar-logo" src={sBahnIconUrl} alt="S-Bahn logo" />
                    <div className="navbar-brand">
                        S-Bahn Tracker
                    </div>
                </div>
                <div className="navbar-actions">
                    <span className="navbar-counter">Currently Rendering {movementCount} Trains</span>
                    <button className="navbar-refresh" onClick={handleRefreshClick}>
                        Refresh
                    </button>
                </div>
                <button
                    className="navbar-menu-toggle fa-solid fa-bars fa-2x"
                    onClick={() => setMenuOpen((open) => !open)}
                    aria-expanded={menuOpen}
                    aria-label="Toggle menu"
                />
            </nav>
            <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
                <span className="navbar-counter">Currently Rendering {movementCount} Trains</span>
                <button className="navbar-refresh" onClick={handleRefreshClick}>
                    Refresh
                </button>
            </div>
        </div>
    )
}

export default Navbar;
