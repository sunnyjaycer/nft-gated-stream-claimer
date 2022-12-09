require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config()

require("@nomiclabs/hardhat-etherscan")
require("@nomiclabs/hardhat-ethers")

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    goerli: {
        url: process.env.GOERLI_URL || "",
        accounts:
            process.env.PRIVATE_KEY !== undefined
                ? [process.env.PRIVATE_KEY]
                : []
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};