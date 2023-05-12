import { useState } from "react";
import ContractInput from "@/components/ContractInput";
import Map from "@/components/Map";

const Insurance = ({ type }) => {
    const units =
        type === "Rainfall"
            ? "mm"
            : type === "Earthquake"
            ? "Richter Scale"
            : type === "Snowfall"
            ? "cm"
            : type === "Temperature"
            ? "°C"
            : "";

    const configLabel =
        type === "Rainfall"
            ? "Rainfall"
            : type === "Earthquake"
            ? "Earthquake"
            : type === "Snowfall"
            ? "Snowfall"
            : type === "Temperature"
            ? "Temperature"
            : "";

    const [rectangleBounds, setRectangleBounds] = useState(null);

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="text-white font-bold text-4xl pb-8">{type} Insurance</div>
            <div className="flex flex-col border-2 lg:flex-row">
                <div className="mx-auto lg:mr-3">
                    <Map changeRectangle={setRectangleBounds} />
                </div>
                <div className="pt-6 pb-20 mx-auto lg:ml-3">
                    <ContractInput configLabel={configLabel} units={units} rectangleBounds={rectangleBounds} />
                </div>
            </div>
        </div>
    );
};

export default Insurance;
