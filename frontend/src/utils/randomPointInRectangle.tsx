interface Point {
    lat: number;
    lng: number;
}

export function randomPoint(bounds: Point[]) {
    const latRange = bounds[0].lat - bounds[1].lat;
    const lngRange = bounds[3].lng - bounds[0].lng;
    const randomLat = bounds[1].lat + Math.random() * latRange;
    const randomLng = bounds[0].lng + Math.random() * lngRange;
    return { lat: randomLat, lng: randomLng };
}
