import { estimate_area } from "../utils/estimate_area";
import { useState } from "react";
import Calendar from "@/components/Calendar";

const ContractInput = ({ configLabel, units, rectangleBounds }) => {
    console.log(configLabel);
    console.log(units);

    const [aboveOrBelow, setAboveOrBelow] = useState("above");
    const [inputValue, setInputValue] = useState("");

    const handleChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleDropdownChange = (e) => {
        setAboveOrBelow(e.target.value);
    };

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
            <div className="flex">
                <select
                    id="config"
                    className="w-6/12 mr-2 text-gray-700 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    value={aboveOrBelow}
                    onChange={handleDropdownChange}
                >
                    <option value="above">Insure for {configLabel} above</option>
                    <option value="below">Insure for {configLabel} below</option>
                </select>
                <input
                    type="number"
                    className="w-3/12 ml-2 text-black border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder={configLabel}
                    min="1"
                    step="0.1"
                    value={inputValue}
                    onChange={handleChange}
                />
                <span className="ml-2 text-gray-400 self-end">{units}</span>
            </div>
            <div className="flex pt-10">
                <Calendar />
            </div>
            <div className="mt-10 flex flex-row items-center">
                <div>Estimated Cost of Insurance</div>
            </div>
        </div>
    );
};

export default ContractInput;
