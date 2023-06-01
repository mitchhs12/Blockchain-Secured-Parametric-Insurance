const { types } = require("hardhat/config")
const { VERIFICATION_BLOCK_CONFIRMATIONS, networkConfig } = require("../../network-config")

task("functions-deploy-payout", "Deploys the Payout contract")
  .addOptionalParam("verify", "Set to true to verify payout contract", false, types.boolean)
  .setAction(async (taskArgs) => {
    if (network.name === "hardhat") {
      throw Error(
        'This command cannot be used on a local hardhat chain.  Specify a valid network or simulate a RecordLabel request locally with "npx hardhat functions-simulate".'
      )
    }

    console.log(`Deploying Payout contract to ${network.name}`)
    const oracleAddress = networkConfig[network.name]["functionsOracleProxy"]
    const linkMaticPriceFeed = networkConfig[network.name]["linkMaticPriceFeed"]
    const maticUsdPriceFeed = networkConfig[network.name]["maticUsdPriceFeed"]
    const vrfSubscriptionId = networkConfig[network.name]["vrfSubscriptionId"]

    console.log("\n__Compiling Contracts__")
    await run("compile")

    const accounts = await ethers.getSigners()

    // Deploy Payout
    const payoutContractFactory = await ethers.getContractFactory("Payout")
    const payoutContract = await payoutContractFactory.deploy(
      oracleAddress,
      linkMaticPriceFeed,
      maticUsdPriceFeed,
      vrfSubscriptionId
    )

    console.log(
      `\nWaiting ${VERIFICATION_BLOCK_CONFIRMATIONS} blocks for transaction ${payoutContract.deployTransaction.hash} to be confirmed...`
    )
    await payoutContract.deployTransaction.wait(VERIFICATION_BLOCK_CONFIRMATIONS)

    // Verify the RecordLabel Contract
    const verifyContract = taskArgs.verify

    if (verifyContract && (process.env.POLYGONSCAN_API_KEY || process.env.ETHERSCAN_API_KEY)) {
      try {
        console.log("\nVerifying contract...")
        await payoutContract.deployTransaction.wait(Math.max(6 - VERIFICATION_BLOCK_CONFIRMATIONS, 0))
        await run("verify:verify", {
          address: payoutContract.address,
          constructorArguments: [oracleAddress, linkMaticPriceFeed, maticUsdPriceFeed, vrfSubscriptionId],
        })
        console.log("Payout verified")
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

    console.log(`\nPayout contract deployed to ${payoutContract.address} on ${network.name}`)
  })
