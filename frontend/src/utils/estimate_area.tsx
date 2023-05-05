export function estimate_area(latitudes: number[], longitudes: number[]): number {
    const R = 6371; // Earth's radius in km
    const toRadians = (degree: number) => degree * (Math.PI / 180);

    // Convert latitudes and longitudes to radians
    const lat1 = toRadians(latitudes[0]);
    const lat2 = toRadians(latitudes[1]);
    const lon1 = toRadians(longitudes[0]);
    const lon2 = toRadians(longitudes[1]);

    // Calculate the differences in latitude and longitude
    const dLat = Math.abs(lat1 - lat2);
    const dLon = Math.abs(lon1 - lon2);

    // Calculate the length of the sides of the square using the Haversine formula
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const sideLength = R * c;

    // Calculate the area of the square
    const area = sideLength * sideLength;

    return area;
}
