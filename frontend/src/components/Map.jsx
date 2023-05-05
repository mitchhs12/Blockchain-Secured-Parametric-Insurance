import React, { useState } from 'react';
import { GoogleMap, LoadScript, DrawingManagerF, useLoadScript } from '@react-google-maps/api';
import ContractInput from './ContractInput';

const mapContainerStyle = {
  height: '400px',
  width: '400px'
};

const center = {
  lat: 38.685,
  lng: -115.234
};

function MyMap({changeRectangle}) {
 
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyBLOuQAyQQbIrn9OqW3aWF0y574rj8MCsA",
    libraries: ["drawing"],
  });

  const onRectangleComplete = rectangle => {
    const bounds = rectangle.getBounds();
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const coordinates = [
      { lat: ne.lat(), lng: ne.lng() },
      { lat: sw.lat(), lng: ne.lng() },
      { lat: sw.lat(), lng: sw.lng() },
      { lat: ne.lat(), lng: sw.lng() }
    ];
    changeRectangle(coordinates);
    console.log('Rectangle Bounds:', coordinates);
  };

  return (
    <div>
      {isLoaded && (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={10}
          center={center}
        >
          <DrawingManagerF
            onLoad={drawingManager => console.log(drawingManager)}
            onRectangleComplete={onRectangleComplete}
            options={{
              drawingControl: true,
              drawingControlOptions: {
                position: window.google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [window.google.maps.drawing.OverlayType.RECTANGLE]
              },
              rectangleOptions: {
                fillColor: '#FFFF00',
                fillOpacity: 0.5,
                strokeWeight: 2,
                strokeColor: '#FFFF00',
                clickable: true,
                editable: true,
                draggable: true,
                zIndex: 1
              }
            }}
          />
        </GoogleMap>
      )}
    </div>
  );
}

export default React.memo(MyMap);
