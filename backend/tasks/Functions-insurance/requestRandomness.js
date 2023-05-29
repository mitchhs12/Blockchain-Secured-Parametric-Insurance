const { getDecodedResultLog, getRequestConfig } = require("../../FunctionsSandboxLibrary")
const { generateRequest } = require("../Functions-client/buildRequestJSON")
const { networks } = require("../../networks")
const utils = require("../utils")
const chalk = require("chalk")
const { deleteGist } = require("../utils/github")
const { RequestStore } = require("../utils/artifact")

task("functions-request-randomness", "Initiates a request from a Functions client contract")
  .addParam("contract", "Address of the client contract to call")
  .addOptionalParam(
    "gaslimit",
    "Maximum amount of gas that can be used to call fulfillRequest in the client contract",
    100000,
    types.int
  )
  .addOptionalParam("requestgas", "Gas limit for calling the estimateInsurance function", 1_500_000, types.int)
  .setAction(async (taskArgs, hre) => {
    // A manual gas limit is required as the gas limit estimated by Ethers is not always accurate
    const overrides = {
      gasLimit: taskArgs.requestgas,
    }

    if (network.name === "hardhat") {
      throw Error(
        'This command cannot be used on a local development chain.  Specify a valid network or simulate an Functions request locally with "npx hardhat functions-simulate".'
      )
    }

    // Get the required parameters
    const contractAddr = taskArgs.contract
    // Attach to the required contracts
    const clientContractFactory = await ethers.getContractFactory("Insurance")
    const clientContract = clientContractFactory.attach(contractAddr)

    // Initiate the on-chain request after all listeners are initialized
    const requestTx = await clientContract.getRandomWords()
    spinner.start("Waiting 2 blocks for transaction to be confirmed...")
    const requestTxReceipt = await requestTx.wait(2)
    spinner.info(
      `Transaction confirmed, see ${
        utils.getEtherscanURL(network.config.chainId) + "tx/" + requestTx.hash
      } for more details.`
    )
    spinner.stop()
    requestId = requestTxReceipt.events[2].args.id
    spinner.start(
      `Request ${requestId} has been initiated. Waiting for fulfillment from the Decentralized Oracle Network...\n`
    )
    // If a response is not received in time, the request has exceeded the Service Level Agreement
    setTimeout(async () => {
      spinner.fail(
        "A response has not been received within 5 minutes of the request being initiated and has been canceled. Your subscription was not charged. Please make a new request."
      )
      await store.update(requestId, { status: "pending_timed_out" })
      reject()
    }, 300_000) // TODO: use registry timeout seconds
  })
