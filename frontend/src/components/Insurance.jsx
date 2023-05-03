import { useState } from 'react';
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

  const handleRectangleBoundsChange = bounds => {
    setRectangleBounds(bounds);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-white font-bold text-4xl pb-8">{type} Insurance</div>
      <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-center lg:pb-4">
        <div className="w-full lg:pr-4 xl:pr-8">
          <div className="h-96 w-full lg:h-auto border-2 max-w-2xl mx-auto lg:max-w-lg">
            <Map onRectangleBoundsChange={handleRectangleBoundsChange} />
          </div>
        </div>
        <div className="w-full lg:pl-4 xl:pl-8 pt-10 pb-20">
          <ContractInput configLabel={configLabel} rectangleBounds={rectangleBounds} />
        </div>
      </div>
    </div>
  );
};

export default Insurance;

