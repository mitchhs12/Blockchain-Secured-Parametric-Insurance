import React, { useState } from "react";
import Insurance from "@/components/Insurance";
import Buttons from "@/components/Buttons";
import BackButton from "@/components/BackButton";

const Content = ({ setBackgroundColor }) => {
    const [selectedInsurance, setSelectedInsurance] = useState(null);
    const [showButtons, setShowButtons] = useState(true);

    const handleButtonClick = (insuranceType, color) => {
        setSelectedInsurance(insuranceType);
        setShowButtons(false);
        setBackgroundColor(color);
    };

    const handleBackButtonClick = (color) => {
        setSelectedInsurance(null);
        setShowButtons(true);
        setBackgroundColor("#ff0000");
    };

    const renderContent = () => {
        if (showButtons) {
            return <Buttons onButtonClick={handleButtonClick} />;
        } else {
            return <Insurance type={selectedInsurance} />;
        }
    };

    return (
        <div className="flex flex-col justify-center items-center h-full">
            {selectedInsurance && (
                <div className="absolute bottom-0 mb-4 mr-4">
                    <BackButton onButtonClick={handleBackButtonClick} />
                </div>
            )}
            <div className="flex flex-col items-center mt-8">
                {renderContent()}
                <div className="text-center mb-6">{/* Your text goes here */}</div>
            </div>
        </div>
    );
};

export default Content;
