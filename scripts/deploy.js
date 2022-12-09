// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  
  signer = await hre.ethers.getSigner()
  console.log("Deploying Account Address:", signer.address);

  // deploy contracts
  // let SunnyNft = await ethers.getContractFactory("SunnyNft", signer);
  // sunnyNft = await SunnyNft.deploy();
  // await sunnyNft.deployed();
  // console.log("SunnyNFT:", sunnyNft.address)

  let StreamClaimer = await ethers.getContractFactory("StreamClaimer", signer)
  streamClaimer = await StreamClaimer.deploy(
    "0xF2d68898557cCb2Cf4C10c3Ef2B034b2a69DAD00",  // daix.address, 
    "0xaf043775eE7879C684b3995a580F70a27957C88b"   // sunnyNft.address
  )
  await streamClaimer.deployed()
  console.log("StreamClaimer:", streamClaimer.address)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
