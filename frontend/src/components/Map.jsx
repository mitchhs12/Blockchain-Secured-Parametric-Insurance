import React, { useState, useEffect, useRef } from "react";
import { GoogleMap, DrawingManagerF, useLoadScript, StandaloneSearchBox } from "@react-google-maps/api";

function MyMap({ changeRectangle }) {
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const isLargeScreen = screenWidth > 1023;

    const mapContainerStyle = {
        height: isLargeScreen ? "60vh" : "50vh",
        width: isLargeScreen ? "40vw" : "80vw",
    };

    const center = {
        lat: 51.5027477,
        lng: -0.1291531,
    };

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: "AIzaSyBLOuQAyQQbIrn9OqW3aWF0y574rj8MCsA",
        libraries: ["drawing", "places"],
    });

    const [searchBox, setSearchBox] = useState(null);
    const searchBoxRef = useRef(null);

    const onSearchBoxLoad = (ref) => {
        setSearchBox(ref);
    };

    const onPlacesChanged = () => {
        if (searchBox) {
            const places = searchBox.getPlaces();
            if (places && places.length > 0) {
                const place = places[0];
                const newCenter = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                };
                setMapCenter(newCenter);
            }
        }
    };

    const [currentRectangle, setCurrentRectangle] = useState(null);
    const [mapCenter, setMapCenter] = useState(center);

    const updateCoordinates = (rectangle) => {
        const bounds = rectangle.getBounds();
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        const coordinates = [
            { lat: ne.lat(), lng: ne.lng() },
            { lat: sw.lat(), lng: ne.lng() },
            { lat: sw.lat(), lng: sw.lng() },
            { lat: ne.lat(), lng: sw.lng() },
        ];
        changeRectangle(coordinates);
        console.log("Rectangle Bounds:", coordinates);
    };

    const onOverlayComplete = (overlay) => {
        if (currentRectangle) {
            currentRectangle.setMap(null);
        }

        const rectangle = overlay.overlay;
        setCurrentRectangle(rectangle);
        updateCoordinates(rectangle);
        updateMap(rectangle);

        rectangle.addListener("bounds_changed", () => {
            updateCoordinates(rectangle);
        });
    };

    const updateMap = (rectangle) => {
        setMapCenter(rectangle.getBounds().getCenter());
        console.log("center is");
        console.log(rectangle.getBounds().getCenter());
    };

    const mapRef = useRef();

    return (
        <div>
            {" "}
            {isLoaded && (
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    zoom={15}
                    center={mapCenter}
                    options={{
                        fullscreenControl: false,
                        streetViewControl: false,
                    }}
                >
                    <StandaloneSearchBox onLoad={onSearchBoxLoad} onPlacesChanged={onPlacesChanged}>
                        <input
                            type="text"
                            placeholder="Search location"
                            style={{
                                boxSizing: `border-box`,
                                border: `1px solid transparent`,
                                width: isLargeScreen ? "50%" : "65%", // Update the width here
                                height: `32px`,
                                marginBottom: `27px`,
                                padding: `0 12px`,
                                borderRadius: `3px`,
                                boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                                fontSize: `14px`,
                                outline: `none`,
                                textOverflow: `ellipses`,
                                position: "absolute",
                                left: "50%",
                                bottom: "0px",
                                transform: "translateX(-50%)", // This will center the input box
                            }}
                        />
                    </StandaloneSearchBox>

                    <DrawingManagerF
                        onLoad={(drawingManager) => console.log(drawingManager)}
                        onOverlayComplete={onOverlayComplete}
                        options={{
                            gestureHandling: true,
                            drawingControl: true,
                            drawingControlOptions: {
                                position: window.google.maps.ControlPosition.TOP_RIGHT,
                                drawingModes: [window.google.maps.drawing.OverlayType.RECTANGLE],
                            },
                            rectangleOptions: {
                                fillColor: "#FFFF00",
                                fillOpacity: 0.5,
                                strokeWeight: 2,
                                strokeColor: "#FFFF00",
                                clickable: true,
                                editable: true,
                                draggable: true,
                                zIndex: 1,
                            },
                        }}
                    />
                </GoogleMap>
            )}
        </div>
    );
}

export default React.memo(MyMap);
