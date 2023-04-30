import React, { useState } from "react";
import Insurance from "@/components/Insurance";
import Buttons from "@/components/Buttons";
import BackButton from "@/components/BackButton";

const Content = () => {
    const [selectedInsurance, setSelectedInsurance] = useState(null);
    const [showButtons, setShowButtons] = useState(true);

    const handleButtonClick = (insuranceType) => {
        setSelectedInsurance(insuranceType);
        setShowButtons(false);
    };

    const handleBackButtonClick = () => {
        setSelectedInsurance(null);
        setShowButtons(true);
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
            {renderContent()}
            {selectedInsurance && <BackButton onButtonClick={handleBackButtonClick} />}
            <div className="text-center mb-6">{/* Your text goes here */}</div>
        </div>
    );
};

export default Content;
