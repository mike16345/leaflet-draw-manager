import "./App.css";
import { MapContainer, TileLayer } from "react-leaflet";
import SketchesToolbar from "./SketchesToolbar";

function App() {
  const position = { lat: 44.5, lng: -89.5 };

  return (
    <>
      <MapContainer
        className="map map-container z-[1]"
        minZoom={6}
        zoom={14}
        zoomControl={false}
        center={position}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          // tms={true}
          maxNativeZoom={16}
          maxZoom={20}
        />
        <SketchesToolbar />
      </MapContainer>
    </>
  );
}

export default App;
