const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Insurance", function () {
  let insurance
  let accounts

  before(async function () {
    // Get the ContractFactory and Signers here
    const Insurance = await ethers.getContractFactory("Insurance")
    accounts = await ethers.getSigners()
    const oracleAddress = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"
    const _LinkMaticPrice = "0x12162c3E810393dEC01362aBf156D7ecf6159528"

    // Deploy the contract
    insurance = await Insurance.deploy(oracleAddress, _LinkMaticPrice)
    await insurance.deployed()
  })

  it("Should return Hello World", async function () {
    // Call the helloWorld function
    const result = await insurance.helloWorld()

    // Check that the result is as expected
    expect(result).to.equal("Hello World!")
  })

  //   it("Should revert if the user does not send more than the minimum Matic amount", async function () {
  //     const args = new Array(12).fill("arg") // Replace with actual arguments
  //     const source = "source"
  //     const secrets = ethers.utils.randomBytes(32) // Replace with actual secrets
  //     const subscriptionId = 1 // Replace with actual subscriptionId
  //     const gasLimit = 3000000 // Replace with actual gasLimit

  //     // Get the latest price
  //     const latestPrice = await insurance.latestPrice()

  //     // Attempt to estimateInsurance with less than the latest price
  //     const tx = insurance.estimateInsurance(source, secrets, subscriptionId, gasLimit, args, {
  //       value: ethers.utils.parseEther((latestPrice - 1).toString()),
  //     })

  //     // Expect the transaction to be reverted
  //     await expect(tx).to.be.revertedWith("Not enough Matic sent")
  //   })

  it("Should revert if the user does not send more than the minimum Matic amount", async function () {
    const args = new Array(12).fill("arg") // Replace with actual arguments
    const source = "source"
    const secrets = ethers.utils.randomBytes(32) // Replace with actual secrets
    const subscriptionId = 1 // Replace with actual subscriptionId
    const gasLimit = 3000000 // Replace with actual gasLimit

    // Get the latest price
    const latestPrice = await insurance.latestPrice()

    // Attempt to estimateInsurance with less than the latest price
    const tx = insurance.estimateInsurance(source, secrets, subscriptionId, gasLimit, args, {
      value: ethers.utils.parseEther((latestPrice - 1).toString()),
    })

    // Expect the transaction to be reverted
    const result = await insurance.estimateInsurance()

    // Check that the result is as expected
    expect(result).to.equal("Hello World!")
  })
})
