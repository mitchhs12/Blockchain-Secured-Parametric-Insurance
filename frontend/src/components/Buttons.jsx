import { useAccount, useContract, useProvider, useContractEvent, useSigner, useBalance } from "wagmi";
import { abi as insuranceAbi } from "../../../backend/build/artifacts/contracts/Insurance.sol/Insurance.json";
import { abi as payoutAbi } from "../../../backend/build/artifacts/contracts/CheckPayout.sol/CheckPayout.json";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

const Buttons = ({ onButtonClick }) => {
    const [activePolicyLength, setActivePolicyLength] = useState(null);
    const [insuranceQuoteData, setInsuranceQuoteData] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState({});
    const [amountInMatic, setAmountInMatic] = useState(null);
    const [maticBalance, setMaticBalance] = useState(null);

    const { isConnected, address } = useAccount();

    const balanceQuery = useBalance({ address: address, chainId: 80001 });
    console.log(maticBalance, amountInMatic);

    useEffect(() => {
        if (balanceQuery.isError) {
            console.error("Error loading balance: ", balanceQuery.error);
        } else if (balanceQuery.data) {
            console.log("Balance: ", balanceQuery.data?.formatted, balanceQuery.data?.symbol);
            setMaticBalance(balanceQuery.data?.formatted);
        }
    }, [balanceQuery.isError, balanceQuery.data]);

    const { data: signer } = useSigner();
    const provider = useProvider({ chainId: 80001 });

    const insuranceContract = useContract({
        address: "0x0A99be0fA440C8931C3826F1A25EB92836cc9766",
        abi: insuranceAbi,
        signerOrProvider: signer || provider,
    });

    const payoutContract = useContract({
        address: "0x80Ec7aa620a6e8a0689FdFaf8A219680d33241c4",
        abi: payoutAbi,
        signerOrProvider: signer || provider,
    });

    useContractEvent({
        address: "0x0A99be0fA440C8931C3826F1A25EB92836cc9766",
        abi: insuranceAbi,
        eventName: "PolicyStarted",
        listener(log) {
            console.log("PolicyStarted event detected!", log);
            setIsLoading((prevState) => ({ ...prevState, [policyIndex]: false }));
        },
    });

    useContractEvent({
        address: "0x80Ec7aa620a6e8a0689FdFaf8A219680d33241c4",
        abi: payoutAbi,
        eventName: "TimeRemaining",
        listener(log) {
            console.log("TimeRemaining event detected!", log);
            setIsLoading((prevState) => ({ ...prevState, [policyIndex]: false }));
        },
    });

    const fetchCostAndCalculate = async (cost) => {
        const priceOfMatic = await contract.getPriceMaticUsd();
        const amount = Math.round((cost * 10 ** 8) / priceOfMatic);
        setAmountInMatic(amount);
        //setAmountInMatic(0.01); //used to verify that the user can pay for the policy
    };

    const POLICIES_PER_PAGE = 5;

    const onPageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const Spinner = () => (
        <svg className="animate-spin h-5 w-5 mr-3 ..." viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
        </svg>
    );

    const paginatedData = insuranceQuoteData
        ? insuranceQuoteData.slice(currentPage * POLICIES_PER_PAGE, (currentPage + 1) * POLICIES_PER_PAGE)
        : null;

    const getPolicyData = async () => {
        try {
            const result = await insuranceContract.getAllUserPolicies(address);
            setActivePolicyLength(result.length);
            const insuranceQuoteDataArray = await Promise.all(
                result.map(async (policy, index) => {
                    const requestId = await insuranceContract.policyRequestIdMapping(address, index);
                    const { user, policyIndex, cost } = await insuranceContract.insuranceQuoteData(requestId);
                    const result = await insuranceContract.getPolicyData(address, policyIndex);
                    const fromTime = result[result.length - 2];
                    const toTime = result[result.length - 3];
                    const fromDate = new Date(fromTime * 1000);
                    const toDate = new Date(toTime * 1000);
                    const policyStatus = await insuranceContract.policyStatus(address, policyIndex);
                    setIsLoading(false);
                    return { policyIndex, cost, policyStatus, requestId, fromDate, toDate };
                })
            );
            setInsuranceQuoteData(insuranceQuoteDataArray);
        } catch (error) {
            console.log("Failed to fetch policy data: ", error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setIsLoading(true);
        getPolicyData();
    }, []);

    const startPolicy = async (cost, requestId, policyIndex) => {
        setIsLoading((prevState) => ({ ...prevState, [policyIndex]: true }));
        try {
            const priceOfMatic = await insuranceContract.getPriceMaticUsd();
            console.log("matic:", priceOfMatic);
            const amountInMatic = Math.round((cost * 10 ** 8) / priceOfMatic);
            console.log("amountInMatic:", amountInMatic);
            const options = { value: ethers.utils.parseUnits(amountInMatic.toString(), "ether") };
            console.log(options);
            const result = await insuranceContract.startPolicy(requestId, options);
            console.log(result);
        } catch (error) {
            console.log("Failed to start policy: ", error);
        }
        setIsLoading((prevState) => ({ ...prevState, [policyIndex]: false }));
    };

    const checkPayout = async (policyIndex) => {
        setIsLoading((prevState) => ({ ...prevState, [policyIndex]: true }));
        try {
            const options = { gasLimit: 2100000 };
            const result = await payoutContract.checkPolicy(1316, 300000, policyIndex, options);
            console.log(result);
        } catch (error) {
            console.log("Failed to check payout: ", error);
            setIsLoading((prevState) => ({ ...prevState, [policyIndex]: false }));
        }
    };

    return (
        <>
            <h2 className="text-4xl h-full w-full items-center pt-10 font-bold text-white text-center mb-6">
                Create a Policy
            </h2>
            <div className="flex h-full w-full flex-wrap sm:justify-between mb-20">
                <div className="flex h-full w-full flex-wrap justify-center gap-2">
                    <button
                        className="w-1/2 sm:w-auto h-10 sm:h-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2 sm:mb-0 mx-2 flex items-center justify-center text-center"
                        onClick={() => onButtonClick("Rainfall", "#78c4fa")}
                    >
                        Rainfall
                    </button>
                    <button
                        disabled={true}
                        className="w-1/2 sm:w-auto h-10 sm:h-auto bg-gray-500  text-white font-bold py-2 px-4 rounded mb-2 sm:mb-0 mx-2 flex items-center justify-center text-center"
                        onClick={() => onButtonClick("Temperature", "#fa8b46")}
                    >
                        Temperature
                    </button>
                    <button
                        disabled={true}
                        className="w-1/2 sm:w-auto h-10 sm:h-auto bg-gray-500 text-white font-bold py-2 px-4 rounded mb-2 sm:mb-0 mx-2 flex items-center justify-center text-center"
                        onClick={() => onButtonClick("Earthquake", "#76fa46")}
                    >
                        Earthquake
                    </button>
                    <button
                        disabled={true}
                        className="w-1/2 sm:w-auto h-10 sm:h-auto bg-gray-500 text-white font-bold py-2 px-4 rounded mb-2 sm:mb-0 mx-2 flex items-center justify-center text-center"
                        onClick={() => onButtonClick("Snowfall", "#ecf0f1")}
                    >
                        Snowfall
                    </button>
                </div>
            </div>

            <div className="flex flex-col justify-center items-center">
                {paginatedData !== null ? (
                    paginatedData.map(
                        (quote, index) =>
                            quote.cost !== 0 && (
                                <div
                                    key={index}
                                    className="flex flex-col sm:w-auto justify-start items-center text-2xl text-white pb-10"
                                >
                                    <h3 className="font-bold">
                                        {`Policy ${Number(quote.policyIndex) + 1}: ${
                                            quote.policyStatus === 0
                                                ? "Pending"
                                                : quote.policyStatus === 1
                                                ? "Started"
                                                : "Ended"
                                        }`}
                                    </h3>
                                    {quote.policyStatus === 0 && (
                                        <>
                                            <h4 className="mt-2">
                                                {quote.fromDate.toLocaleDateString()} -{" "}
                                                {quote.toDate.toLocaleDateString()}
                                            </h4>
                                            <button
                                                className="mt-2 sm:w-auto bg-orange-400 hover:bg-orange-700 text-white font-bold px-4 py-2 rounded mb-1 flex items-center justify-center text-center"
                                                onClick={() =>
                                                    startPolicy(quote.cost, quote.requestId, quote.policyIndex)
                                                }
                                            >
                                                {isLoading[quote.policyIndex] ? (
                                                    <div className="flex items-center justify-center">
                                                        <Spinner />
                                                        Processing...
                                                    </div>
                                                ) : (
                                                    <div>{`Start Cost: $${quote.cost}.00`}</div>
                                                )}
                                            </button>
                                        </>
                                    )}
                                    {quote.policyStatus === 1 && (
                                        <>
                                            <h4 className="mt-2">
                                                {quote.fromDate.toLocaleDateString()} -{" "}
                                                {quote.toDate.toLocaleDateString()}
                                            </h4>
                                            <button
                                                className="mt-2 sm:w-auto  bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded mb-1 flex items-center justify-center text-center"
                                                onClick={() => checkPayout(quote.policyIndex)}
                                            >
                                                {isLoading[quote.policyIndex] ? (
                                                    <div className="flex items-center justify-center">
                                                        <Spinner />
                                                        Processing...
                                                    </div>
                                                ) : (
                                                    "Check Payout"
                                                )}
                                            </button>
                                        </>
                                    )}
                                    {quote.policyStatus === 2 && (
                                        <>
                                            <h4 className="mt-2">
                                                {quote.fromDate.toLocaleDateString()} -{" "}
                                                {quote.toDate.toLocaleDateString()}
                                            </h4>
                                            <button
                                                className="mt-2 sm:w-auto  bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-1 flex items-center justify-center text-center"
                                                onClick={() => checkPayout(quote.policyIndex)}
                                            >
                                                {isLoading[quote.policyIndex] ? (
                                                    <div className="flex items-center justify-center">
                                                        <Spinner />
                                                        Processing...
                                                    </div>
                                                ) : (
                                                    "Check Payout"
                                                )}
                                            </button>
                                        </>
                                    )}
                                </div>
                            )
                    )
                ) : (
                    <h3 className="text-2xl text-white">
                        <div className="flex items-center justify-center">
                            <Spinner />
                            Retrieving Latest Policy Data...
                        </div>
                    </h3>
                )}
                <div className="flex justify-between items-center">
                    {currentPage !== 0 && (
                        <button
                            className="px-4 py-2 rounded text-white bg-gray-600 hover:bg-gray-800"
                            onClick={() => onPageChange(currentPage - 1)}
                        >
                            Previous
                        </button>
                    )}
                    {insuranceQuoteData &&
                        currentPage !== Math.ceil(insuranceQuoteData.length / POLICIES_PER_PAGE) - 1 && (
                            <button
                                className="px-4 py-2 rounded text-white bg-gray-600 hover:bg-gray-800"
                                onClick={() => onPageChange(currentPage + 1)}
                            >
                                Next
                            </button>
                        )}
                </div>
            </div>
        </>
    );
};
export default Buttons;
