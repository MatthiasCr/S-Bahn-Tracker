import 'leaflet/dist/leaflet.css';
import '../css/Map.css';
import { MapContainer, TileLayer, Marker, Popup, Polyline, LayerGroup, Circle } from 'react-leaflet';
import { type Movement, radar } from '../services/api'
import { useState, useEffect } from 'react';
import Vehicle from './Vehicle';

function Map() {
    // const [stations, setStations] = useState<Station[]>([]);
    const [trips, setTrips] = useState<Movement[]>([]);

    // useEffect(() => {
    //     const fetchStations = async () => {
    //         try {
    //             const latitude = 52.517275;
    //             const longitude = 13.381406;
    //             const numberOfStations = 200;
    //             const data = await getNearestStations(latitude, longitude, numberOfStations);
    //             setStations(data);
    //             console.log(data);

    //         } catch (error) {
    //             console.error('Unable to load stations', error);
    //         }
    //     };

    //     fetchStations();
    // }, []);

    // useEffect(() => {
    //     const fetchShape = async () => {
    //         try {
    //             const data = await getShape();
    //             setShape(data);
    //         } catch (error) {
    //             console.error('Unable to load stations', error);
    //         }
    //     };
    //     fetchShape();
    // }, []);

    // useEffect(() => {
    //     const fetchTrips = async () => {
    //         try {
    //             const data = await getCurrentTrips();
    //             setTrips(data.trips);
    //             console.log(data.trips);
    //         } catch (error) {
    //             console.error('Unable to load stations', error);
    //         }
    //     };
    //     fetchTrips();
    // }, []);

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const data = await radar();
                setTrips(data);
                console.log(data);
            } catch (error) {
                console.error('Unable to load stations', error);
            }
        };
        fetchTrips();
    }, []);

    const blackOptions = { color: 'black' }

    // console.log(trips);

    return (
        <div className="map-container">
            <MapContainer center={[52.517275, 13.381406]} zoom={15} scrollWheelZoom={true}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* {stations.map((station) => {
                    if (!station.location) return null;

                    return (
                        <Marker
                            key={station.id}
                            position={[station.location.latitude, station.location.longitude]}
                        >
                            <Popup>{station.name}</Popup>
                        </Marker>
                    );
                })} */}

                <LayerGroup>
                    {trips.map((trip) => {
                        return <Vehicle trip={trip} />

                    })}
                </LayerGroup>

                {/* <Polyline pathOptions={blackOptions} positions={shape} /> */}
            </MapContainer>

        </div>
    );
}

export default Map;
