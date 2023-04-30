import { GoogleMap, useLoadScript } from "@react-google-maps/api";

const containerStyle = {
    height: "50vh",
    width: "50vw",
};

const mapContainerStyle = {
    height: "50%",
    width: "50%",
};

const center = {
    lat: 48.8584,
    lng: 2.2945,
};

const defaultZoom = 10;

const App = () => {
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
    });

    return (
        <div className="h-screen w-screen flex">
            {!isLoaded ? (
                <h1>Loading...</h1>
            ) : (
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    options={{ zoomControl: true }}
                    zoom={defaultZoom}
                    center={center}
                    mapContainerClassName="rounded-md"
                    containerStyle={containerStyle}
                />
            )}
        </div>
    );
};

export default App;
