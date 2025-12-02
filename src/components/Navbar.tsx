import '../css/Navbar.css'

function Navbar({ onRefresh }: { onRefresh?: () => void }) {
    return (
        <>
            <nav className="navbar">
                <div className="navbar-left">
                    <img className="navbar-logo" src="src/assets/s-bahn.svg" />
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
