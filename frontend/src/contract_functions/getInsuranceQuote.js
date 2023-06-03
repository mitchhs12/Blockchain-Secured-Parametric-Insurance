const Moralis = require("moralis").default;
const { EvmChain } = require("@moralisweb3/common-evm-utils");
import { abi as insuranceAbi } from "../../../backend/build/artifacts/contracts/Insurance.sol/Insurance.json";
import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";

export async function getInsuranceQuote(args) {
    const insuranceContractAddress = "0x0A99be0fA440C8931C3826F1A25EB92836cc9766";
    const gasLimit = 300000;
    const subscriptionId = 1316;

    const config = usePrepareContractWrite({
        address: insuranceContractAddress,
        functionName: "estimateInsurance(string[],uint64,uint32)",
        abi: insuranceAbi,
        chain: 80001,
        params: [args, subscriptionId, gasLimit],
    });

    const { write } = useContractWrite(config);

    const { result, error, isLoading } = write();

    if (error) {
        console.log(error);
    }

    if (result) {
        console.log(result);
    }

    return result;
}
