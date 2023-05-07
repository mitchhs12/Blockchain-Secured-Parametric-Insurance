import { estimate_area } from "../utils/estimate_area";

const ContractInput = ({ configLabel, rectangleBounds }) => {
    let center = "";
    let area = "";
    if (rectangleBounds) {
        const latSum = rectangleBounds.reduce((sum, corner) => sum + corner.lat, 0);
        const lngSum = rectangleBounds.reduce((sum, corner) => sum + corner.lng, 0);
        const centerLat = latSum / 4;
        const centerLng = lngSum / 4;
        center = { lat: centerLat, lng: centerLng };
        console.log(center);

        const latitudes = rectangleBounds.map((corner) => corner.lat);
        const longitudes = rectangleBounds.map((corner) => corner.lng);
        area = estimate_area(latitudes, longitudes);
        console.log(`The area of the region is approximately ${area} square kilometers.`);
    }

    return (
        <div className=" text-white font-bold p-4 text-l">
            Please select your area with the tool in the top right corner of the map.
            <div className="mt-6 mb-6 flex">
                <div className="w-9/12">
                    <input
                        id="coordinates"
                        type="text"
                        className="w-full border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        placeholder="Your Area's Center Coordinates (Lat, Long)"
                        value={center ? `${center.lat}, ${center.lng}` : ""}
                        readOnly
                        style={{ color: "black" }}
                    />
                </div>
                <div className="ml-6 w-3/12">
                    <input
                        id="size"
                        type="text"
                        className="w-full border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        placeholder="Area (km²)"
                        value={
                            area
                                ? Math.abs(area) >= 1
                                    ? `${area.toFixed(0)}km²`
                                    : `${area.toFixed(Math.abs(Math.floor(Math.log10(Math.abs(area)))) + 4)}km²`
                                : ""
                        }
                        readOnly
                        style={{ color: "black" }}
                    />
                </div>
            </div>
            <div className="mb-6 flex flex-row items-center">
                <div>
                    <input
                        id="config"
                        type="number"
                        className="w-full border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        placeholder={configLabel}
                        min="1"
                    />
                </div>
            </div>
            <div className="mb-6 flex flex-row items-center">
                <div>
                    <input
                        id="days"
                        type="number"
                        className="w-full border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        placeholder="Number of Days"
                        min="1"
                    />
                </div>
            </div>
            <div className="mb-6 flex flex-row items-center">
                <div>Estimated Cost of Insurance</div>
            </div>
            <div className="mb-6 flex flex-row items-center">
                <div>Cost of Insurance</div>
            </div>
        </div>
    );
};

export default ContractInput;
