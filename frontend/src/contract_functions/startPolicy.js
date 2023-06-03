const Moralis = require("moralis").default;
const { EvmChain } = require("@moralisweb3/common-evm-utils");
import { abi as insuranceAbi } from "../../../backend/build/artifacts/contracts/Insurance.sol/Insurance.json";

export async function startPolicy() {
    const insuranceContractAddress = "0x0A99be0fA440C8931C3826F1A25EB92836cc9766";

    const response = await Moralis.EvmApi.utils.runContractFunction({
        address: insuranceContractAddress,
        functionName: "startPolicy",
        abi: insuranceAbi,
        chain: EvmChain.MUMBAI,
    });

    console.log(response.toJSON());
}
