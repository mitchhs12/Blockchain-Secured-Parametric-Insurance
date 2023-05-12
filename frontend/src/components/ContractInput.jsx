import { estimate_area } from "../utils/estimate_area";
import { useState } from "react";
import Calendar from "@/components/Calendar";
import estimateTemperature from "@/insurance_estimators/temperature.js";
import estimateRainfall from "@/insurance_estimators/rainfall.js";
import estimateSnowfall from "@/insurance_estimators/snowfall.js";
import estimateEarthquake from "@/insurance_estimators/earthquake.js";

const ContractInput = ({ configLabel, units, rectangleBounds }) => {
    console.log(configLabel);
    console.log(units);

    const [aboveOrBelow, setAboveOrBelow] = useState("above");
    const [inputValue, setInputValue] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [isComplete, setIsComplete] = useState(false);

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
            <div className="mt-8 mb-8 flex">
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
                    className="w-4/12 ml-4 text-black border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder={configLabel}
                    min="1"
                    step="0.1"
                    value={inputValue}
                    onChange={handleChange}
                />
                <span className="ml-2 text-gray-400 self-end">{units}</span>
            </div>
            <div className="flex mt-4 justify-center border-2 flex-col sm:flex-row sm:justify-between sm:pr-10">
                <div className="w-auto flex justify-center sm:justify-end">
                    <Calendar fromDate={setFromDate} toDate={setToDate} completed={setIsComplete} />
                </div>
                <div className="w-auto flex sm:justify-start flex-col items-center sm:items-start mt-6 mb-6">
                    From:
                    <br />
                    {fromDate}
                    <br />
                    <br />
                    To:
                    <br />
                    {toDate}
                    <br />
                    <br />
                    {isComplete ? (
                        <button
                            className="w-auto sm:w-auto h-10 sm:h-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2 sm:mb-0 flex items-center justify-center text-center"
                            onClick={() => onButtonClick("Rainfall", "#78c4fa")}
                        >
                            Estimate Cost
                        </button>
                    ) : (
                        "Not complete"
                    )}
                </div>
            </div>
            <div className="flex justify-center">
                TOTAL COST:
                {/* {configLabel === "Snowfall"
                    ? estimateSnowfall(area, location, dateRange, aboveOrBelow)
                    : configLabel === "Earthquake"
                    ? estimateEarthquake(area, location, dateRange, aboveOrBelow)
                    : configLabel === "Rainfall"
                    ? estimateRainfall(area, location, dateRange, aboveOrBelow)
                    : configLabel === "Temperature"
                    ? estimateTemperature(area, location, dateRange, aboveOrBelow)
                    : console.log("Invalid configLabel provided!")} */}
            </div>
        </div>
    );
};

export default ContractInput;
