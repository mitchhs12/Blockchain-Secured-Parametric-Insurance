import { estimate_area } from "../utils/estimate_area";
import { useState, useEffect } from "react";
import Calendar from "@/components/Calendar";
import { estimateTemperature } from "../insurance_estimators/temperature.jsx";
import { estimateRainfall } from "../insurance_estimators/rainfall.jsx";
import { estimateSnowfall } from "../insurance_estimators/snowfall.jsx";
import { estimateEarthquake } from "../insurance_estimators/earthquake.jsx";
import { format } from "date-fns";

const ContractInput = ({ configLabel, units, rectangleBounds }) => {
    const [coordinatesSelected, setCoordinatesSelected] = useState(false);
    const [aboveOrBelow, setAboveOrBelow] = useState("above");
    const [inputValue, setInputValue] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [isComplete, setIsComplete] = useState(false);
    const [center, setCenter] = useState("");
    const [area, setArea] = useState("");
    const [cost, setCost] = useState("");

    const handleChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleDropdownChange = (e) => {
        setAboveOrBelow(e.target.value);
    };

    useEffect(() => {
        if (rectangleBounds) {
            const latSum = rectangleBounds.reduce((sum, corner) => sum + corner.lat, 0);
            const lngSum = rectangleBounds.reduce((sum, corner) => sum + corner.lng, 0);
            const centerLat = latSum / 4;
            const centerLng = lngSum / 4;
            setCenter({ lat: centerLat, lng: centerLng });
            console.log(center);
            setCoordinatesSelected(true);

            const latitudes = rectangleBounds.map((corner) => corner.lat);
            const longitudes = rectangleBounds.map((corner) => corner.lng);
            const estimatedArea = estimate_area(latitudes, longitudes);
            setArea(estimatedArea);
            console.log(`The area of the region is approximately ${area} square kilometers.`);
        }
    }, [rectangleBounds]);

    const renderButtonOrMessage = () => {
        if (coordinatesSelected && inputValue && fromDate && toDate && isComplete) {
            return (
                <button
                    className="w-auto sm:w-auto h-10 sm:h-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2 sm:mb-0 flex items-center justify-center text-center"
                    onClick={onButtonClick}
                >
                    Estimate Cost
                </button>
            );
        } else if (!coordinatesSelected) {
            return "Please select an area";
        } else if (area < 0.1) {
            return "Please select a larger area";
        } else if (!inputValue) {
            return "Please type in a quantity";
        } else if (!fromDate) {
            return "Please select a start date";
        } else if (!toDate) {
            return "Please select an end date";
        } else {
            return "Please fill out the form";
        }
    };

    const onButtonClick = () => {
        const dateRange = { from: fromDate, to: toDate };
        let cost;
        switch (configLabel) {
            case "Snowfall":
                cost = estimateSnowfall(rectangleBounds, area, dateRange, aboveOrBelow, inputValue, center);
                break;
            case "Earthquake":
                cost = estimateEarthquake(rectangleBounds, area, dateRange, aboveOrBelow, inputValue, center);
                break;
            case "Rainfall":
                cost = estimateRainfall(rectangleBounds, area, dateRange, aboveOrBelow, inputValue, center);
                break;
            case "Temperature":
                cost = estimateTemperature(rectangleBounds, area, dateRange, aboveOrBelow, inputValue, center);
                break;
            default:
                console.error("Invalid configLabel provided!");
        }
        setCost(cost);
    };

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
                    {configLabel !== "Rainfall" ? <option value="below">Insure for {configLabel} below</option> : ""}
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
            <div className="flex mt-4 justify-center flex-col sm:flex-row sm:justify-between">
                <div className="w-auto flex justify-center sm:justify-start">
                    <Calendar fromDate={setFromDate} toDate={setToDate} completed={setIsComplete} />
                </div>
                <div className="w-auto flex sm:justify-start flex-col text-right items-center sm:items-end mt-6 mb-6 sm:pr-6">
                    From:
                    <br />
                    {fromDate ? <span>{format(fromDate, "PPP")}</span> : <br />}
                    <br />
                    <br />
                    To:
                    <br />
                    {toDate ? <span>{format(toDate, "PPP")}</span> : <br />}
                    <br />
                    <br />
                    {renderButtonOrMessage()}
                </div>
            </div>
            <div className="flex justify-center">{cost ? <div>TOTAL COST{cost}</div> : ""}</div>
        </div>
    );
};

export default ContractInput;
