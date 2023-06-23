import { ethers } from "hardhat";

async function main() {
  const external = await ethers.deployContract("External");

  await external.waitForDeployment();

  console.log(`deployed to ${external.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
