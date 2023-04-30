import React, { useState } from 'react';
import Rain from "./Rain";


const Content = () => {
    const [selectedInsurance, setSelectedInsurance] = useState(null);
    const [showBackButton, setShowBackButton] = useState(false);

    const handleButtonClick = (insuranceType) => {
        setSelectedInsurance(insuranceType);
        setShowBackButton(true);
    };

    const handleBackButtonClick = () => {
        setSelectedInsurance(null);
        setShowBackButton(false);
    };

    const renderContent = () => {
        if (selectedInsurance) {
            switch (selectedInsurance) {
                case 'Rain':
                    return <Rain />;
                case 'Drought':
                    return <DroughtComponent />;
                case 'Earthquake':
                    return <EarthquakeComponent />;
                case 'Snow':
                    return <SnowComponent />;
                default:
                    return null;
            }
        } else {
            return (
                <>
                    <h2 className="text-4xl font-bold text-white">
                        Please Select an Insurance Package
                    </h2>
                    <div className="flex flex-wrap justify-center mt-6">
                        <button
                            className="w-20 h-20 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-auto mb-4 sm:w-auto sm:h-auto"
                            onClick={() => handleButtonClick('Rain')}
                        >
                            Rain
                        </button>
                        <button
                            className="w-20 h-20 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-auto mb-4 sm:w-auto sm:h-auto"
                            onClick={() => handleButtonClick('Drought')}
                        >
                            Drought
                        </button>
                        <button
                            className="w-20 h-20 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-auto mb-4 sm:w-auto sm:h-auto"
                            onClick={() => handleButtonClick('Earthquake')}
                        >
                            Earthquake
                        </button>
                        <button
                            className="w-20 h-20 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-auto mb-4 sm:w-auto sm:h-auto"
                            onClick={() => handleButtonClick('Snow')}
                        >
                            Snow
                        </button>
                    </div>
                </>
            );
        }
    };

    return (
        <div className="text-center">
            {renderContent()}
            {showBackButton && (
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                    onClick={handleBackButtonClick}
                >
                    Back
                </button>
            )}
        </div>
    );
};

export default Content;
