import './css/App.css'
import Navbar from './components/Navbar';
import Map from './components/Map'
import { useState } from 'react';

function App() {

  const [refreshKey, setRefreshKey] = useState(0);
  const [movementCount, setMovementCount] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((key) => key + 1);
  }

  return (
    <div className="app">
      <Navbar onRefresh={handleRefresh} movementCount={movementCount} />
      <main className="content">
        <Map refreshKey={refreshKey} onMovementsChange={setMovementCount} />
      </main>
    </div>

  )
}

export default App
