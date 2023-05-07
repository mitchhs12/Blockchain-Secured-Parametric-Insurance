import { useState } from "react";
import ContractInput from "@/components/ContractInput";
import Map from "@/components/Map";

const Insurance = ({ type }) => {
    const configLabel =
        type === "Rain"
            ? "Quantity of Rainfall (mm)"
            : type === "Earthquake"
            ? "Magnitude of Earthquake (Richter scale)"
            : type === "Snow"
            ? "Quantity of Snowfall (cm)"
            : type === "Drought"
            ? "Lack of Soil moisture"
            : "";

    const [rectangleBounds, setRectangleBounds] = useState(null);

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="text-white font-bold text-4xl pb-8">{type} Insurance</div>
            <div className="flex flex-col lg:flex-row">
                <div className="border-2 mx-auto lg:mr-4">
                    <Map changeRectangle={setRectangleBounds} />
                </div>
                <div className="border-2 pt-10 pb-20 mx-auto lg:ml-4">
                    <ContractInput configLabel={configLabel} rectangleBounds={rectangleBounds} />
                </div>
            </div>
        </div>
    );
};

export default Insurance;
