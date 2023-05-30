const { types } = require("hardhat/config")
const { VERIFICATION_BLOCK_CONFIRMATIONS, networkConfig } = require("../../network-config")

task("functions-deploy-insurance", "Deploys the Insurance contract")
  .addOptionalParam("verify", "Set to true to verify insurance contract", false, types.boolean)
  .setAction(async (taskArgs) => {
    if (network.name === "hardhat") {
      throw Error(
        'This command cannot be used on a local hardhat chain.  Specify a valid network or simulate a RecordLabel request locally with "npx hardhat functions-simulate".'
      )
    }

    console.log(`Deploying Insurance contract to ${network.name}`)
    const oracleAddress = networkConfig[network.name]["functionsOracleProxy"]
    const priceFeedAddress = networkConfig[network.name]["priceFeedAddress"]
    const vrfSubscriptionId = networkConfig[network.name]["vrfSubscriptionId"]

    console.log(`Here is pricefeed:\n${priceFeedAddress}`)

    if (!ethers.utils.isAddress(priceFeedAddress))
      throw Error("Please provide a valid contract address for the PriceFeed contract")

    console.log("\n__Compiling Contracts__")
    await run("compile")

    const accounts = await ethers.getSigners()

    // Deploy Insurance
    const insuranceContractFactory = await ethers.getContractFactory("Insurance")
    const insuranceContract = await insuranceContractFactory.deploy(oracleAddress, priceFeedAddress, vrfSubscriptionId)

    console.log(
      `\nWaiting ${VERIFICATION_BLOCK_CONFIRMATIONS} blocks for transaction ${insuranceContract.deployTransaction.hash} to be confirmed...`
    )
    await insuranceContract.deployTransaction.wait(VERIFICATION_BLOCK_CONFIRMATIONS)

    // Verify the RecordLabel Contract
    const verifyContract = taskArgs.verify

    if (verifyContract && (process.env.POLYGONSCAN_API_KEY || process.env.ETHERSCAN_API_KEY)) {
      try {
        console.log("\nVerifying contract...")
        await insuranceContract.deployTransaction.wait(Math.max(6 - VERIFICATION_BLOCK_CONFIRMATIONS, 0))
        await run("verify:verify", {
          address: insuranceContract.address,
          constructorArguments: [oracleAddress, priceFeedAddress, vrfSubscriptionId],
        })
        console.log("Insurance verified")
      } catch (error) {
        if (!error.message.includes("Already Verified")) {
          console.log("Error verifying contract.  Try delete the ./build folder and try again.")
          console.log(error)
        } else {
          console.log("Contract already verified")
        }
      }
    } else if (verifyContract) {
      console.log("\nPOLYGONSCAN_API_KEY or ETHERSCAN_API_KEY missing. Skipping contract verification...")
    }

    console.log(`\nInsurance contract deployed to ${insuranceContract.address} on ${network.name}`)
  })
