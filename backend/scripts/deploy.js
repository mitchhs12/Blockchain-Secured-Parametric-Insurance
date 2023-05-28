async function main() {
  const [deployer] = await ethers.getSigners()

  console.log("Deploying contracts with the account:", deployer.address)

  console.log("Account balance:", (await deployer.getBalance()).toString())

  const Insurance = await ethers.getContractFactory("Insurance")
  const insurance = await Insurance.deploy(/* constructor arguments here */)

  console.log("Insurance contract address:", insurance.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
