const BackButton = ({ onButtonClick }) => {
    return (
        <div className="text-center">
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                onClick={() => onButtonClick("Back")}
            >
                Back
            </button>
        </div>
    );
};
export default BackButton;
