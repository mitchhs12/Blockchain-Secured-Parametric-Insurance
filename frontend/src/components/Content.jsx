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
        <div className="flex w-full h-full flex-col justify-center items-center">
            <div>{renderContent()}</div>
            {selectedInsurance && (
                <div>
                    <BackButton onButtonClick={handleBackButtonClick} />
                </div>
            )}
        </div>
    );
};

export default Content;
