const { expect } = require("chai")
const { Framework } = require("@superfluid-finance/sdk-core")
const { ethers } = require("hardhat")
const frameworkDeployer = require("@superfluid-finance/ethereum-contracts/dev-scripts/deploy-test-framework")
const TestToken = require("@superfluid-finance/ethereum-contracts/build/contracts/TestToken.json")

let sfDeployer
let contractsFramework
let sf
let streamClaimer
let sunnyNft
let dai
let daix

// Test Accounts
let owner
let account1
let account2

const thousandEther = ethers.utils.parseEther("10000")

before(async function () {
  // get hardhat accounts
  ;[owner, account1, account2] = await ethers.getSigners()

  sfDeployer = await frameworkDeployer.deployTestFramework()

  // GETTING SUPERFLUID FRAMEWORK SET UP

  // deploy the framework locally
  contractsFramework = await sfDeployer.getFramework()

  // initialize framework
  sf = await Framework.create({
      chainId: 31337,
      provider: owner.provider,
      resolverAddress: contractsFramework.resolver, // (empty)
      protocolReleaseVersion: "test"
  })

  // DEPLOYING DAI and DAI wrapper super token
  tokenDeployment = await sfDeployer.deployWrapperSuperToken(
      "Fake DAI Token",
      "fDAI",
      18,
      ethers.utils.parseEther("100000000").toString()
  )

  daix = await sf.loadSuperToken("fDAIx")
  dai = new ethers.Contract(
      daix.underlyingToken.address,
      TestToken.abi,
      owner
  )
  // minting test DAI
  await dai.mint(owner.address, thousandEther)
  await dai.mint(account1.address, thousandEther)
  await dai.mint(account2.address, thousandEther)

  // approving DAIx to spend DAI (Super Token object is not an ethers contract object and has different operation syntax)
  await dai.approve(daix.address, ethers.constants.MaxInt256)
  await dai
      .connect(account1)
      .approve(daix.address, ethers.constants.MaxInt256)
  await dai
      .connect(account2)
      .approve(daix.address, ethers.constants.MaxInt256)
  // Upgrading all DAI to DAIx
  const ownerUpgrade = daix.upgrade({ amount: thousandEther })
  const account1Upgrade = daix.upgrade({ amount: thousandEther })
  const account2Upgrade = daix.upgrade({ amount: thousandEther })

  await ownerUpgrade.exec(owner)
  await account1Upgrade.exec(account1)
  await account2Upgrade.exec(account2)

  // deploy contracts
  let SunnyNft = await ethers.getContractFactory("SunnyNft", owner);
  sunnyNft = await SunnyNft.deploy();
  await sunnyNft.deployed();

  let StreamClaimer = await ethers.getContractFactory("StreamClaimer", owner)
  streamClaimer = await StreamClaimer.deploy(daix.address, sunnyNft.address)
  await streamClaimer.deployed()

})

describe("StreamClaimer", function () {

  it("happy path", async function () {

    // transfer daix to streamclaimer
    const transferOp = daix.transfer({
      receiver: streamClaimer.address,
      amount: thousandEther
    });
    await transferOp.exec(account1);

    // mint sunny nft
    let tx = await sunnyNft.connect(account1).mint(account1.address);
    await tx.wait();

    // show balance
    console.log(
      "Sunny NFT Balance:",
      (await sunnyNft.balanceOf(account1.address)).toString()
    );

    // claim a stream
    await streamClaimer.connect(account1).claimStream();

    // verify there's a stream
    let res = await sf.cfaV1.getNetFlow({
      superToken: daix.address,
      account: account1.address,
      providerOrSigner: owner
    });
    console.log("Flow is", res, "wei/sec");

  })

});