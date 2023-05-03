import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScriptNext, DrawingManager, StandaloneSearchBox } from "@react-google-maps/api";

function MyComponent() {
    const [center, setCenter] = useState({ lat: 48.858, lng: 2.294 });
    const [searchBox, setSearchBox] = useState(null);
    const [containerStyle, setContainerStyle] = useState({
        width: "380px",
        height: "380px",
    });

    const handleSearchBoxLoad = (ref) => {
        setSearchBox(ref);
    };

    const handlePlacesChanged = () => {
        const places = searchBox.getPlaces();
        if (places && places.length > 0) {
            const { lat, lng } = places[0].geometry.location;
            setCenter({ lat: lat(), lng: lng() });
        }
    };

    const options = {
        streetViewControl: false,
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setContainerStyle({
                    width: "700px",
                    height: "700px",
                });
            } else {
                setContainerStyle({
                    width: "380px",
                    height: "380px",
                });
            }
        };

        handleResize();

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <div className="flex items-center justify-center">
            <LoadScriptNext
                googleMapsApiKey="AIzaSyBZuw3-0hopzdLU8nO3MtpXIW62LoNkfr4" // use process.env
                libraries={["drawing", "places"]}
            >
                <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={15} options={options}>
                    <StandaloneSearchBox onLoad={handleSearchBoxLoad} onPlacesChanged={handlePlacesChanged}>
                        <input
                            type="text"
                            placeholder="Search for a place..."
                            style={{
                                boxSizing: `border-box`,
                                border: `1px solid transparent`,
                                width: `240px`,
                                height: `32px`,
                                padding: `0 12px`,
                                borderRadius: `3px`,
                                boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                                fontSize: `14px`,
                                outline: `none`,
                                textOverflow: `ellipses`,
                                position: "absolute",
                                bottom: "30px",
                                left: "50%",
                                marginLeft: "-120px",
                            }}
                        />
                    </StandaloneSearchBox>
                </GoogleMap>
            </LoadScriptNext>
        </div>
    );
}

export default React.memo(MyComponent);
