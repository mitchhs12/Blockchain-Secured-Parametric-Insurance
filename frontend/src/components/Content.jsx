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
        <div className="pt-10 flex flex-col justify-center relative min-h-screen">
            <div className="mb-auto">{renderContent()}</div>
            {selectedInsurance && (
                <div className="fixed bottom-0 left-0 right-0 pb-8">
                    <BackButton onButtonClick={handleBackButtonClick} />
                </div>
            )}
        </div>
    );
};

export default Content;
