const Moralis = require("moralis").default;
const { EvmChain } = require("@moralisweb3/common-evm-utils");
import { abi as checkPayoutAbi } from "../../../backend/build/artifacts/contracts/CheckPayout.sol/CheckPayout.json";

export async function checkPolicy() {
    const payoutContractAddress = "0x80Ec7aa620a6e8a0689FdFaf8A219680d33241c4";

    const response = await Moralis.EvmApi.utils.runContractFunction({
        address: payoutContractAddress,
        functionName: "checkPolicy",
        abi: checkPayoutAbi,
        chain: EvmChain.MUMBAI,
    });

    console.log(response.toJSON());
}
