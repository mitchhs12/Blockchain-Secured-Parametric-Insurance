import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, DrawingManagerF, useLoadScript } from "@react-google-maps/api";

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
        lat: 38.685,
        lng: -115.234,
    };

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: "AIzaSyBLOuQAyQQbIrn9OqW3aWF0y574rj8MCsA",
        libraries: ["drawing"],
    });

    const [currentRectangle, setCurrentRectangle] = useState(null);

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

        rectangle.addListener("bounds_changed", () => {
            updateCoordinates(rectangle);
        });
    };

    const onClear = () => {
        if (currentRectangle) {
            currentRectangle.setMap(null);
            setCurrentRectangle(null);
            changeRectangle([]);
        }
    };

    return (
        <div>
            {" "}
            {isLoaded && (
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    zoom={10}
                    center={center}
                    options={{
                        fullscreenControl: false,
                        streetViewControl: false,
                    }}
                >
                    <DrawingManagerF
                        onLoad={(drawingManager) => console.log(drawingManager)}
                        onOverlayComplete={onOverlayComplete}
                        options={{
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
                    <button onClick={onClear}>Clear</button>
                </GoogleMap>
            )}
        </div>
    );
}

export default React.memo(MyMap);
