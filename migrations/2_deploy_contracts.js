var SafeMath = artifacts.require('./SafeMath.sol');
var Fundraiser = artifacts.require("./Fundraiser.sol");

module.exports = function(deployer, network) {
  var beginBlockIn = 0;
  var defaultEtmPerBTC = 50000;

  console.log(`Current network: ${network} `)
  if (network == 'main') {
    var admin = '0x3751BA41b3D5F71e3aEd29f3F12CbA3E1f56cDc8';
    var treasury = '0x3C20415875661dbe7669C46e89c13EeB2359E9f9';
    var btcPerWei = 1/0.04389213 * 1e18; // change
    //var periodBlocks = 209000; // change
  } else if (network == 'classic') {
    var admin = '0x7dD4fA81399440930243b17Cc1e023DcCB2888f0';
    var treasury = '0x3c6fd5B5901dF04e844E6d0d6DA5771BC1C57509';
    var btcPerWei = 1/0.00246100 * 1e18; // change
    //var periodBlocks = 209000; // change
  } else {
    console.log(`Doesn't found settings for current network`);
    return;
  }

  web3.eth.getBlockNumber(async (err, blockNumber) => {
    if (err) {
      console.log(err);
      return;
    }
    //var beginBlock = blockNumber + beginBlockIn;
    //var endBlock = beginBlock + periodBlocks;

    console.log("Height before deployment", blockNumber);
    console.log({ admin, treasury, /*beginBlock, endBlock,*/ btcPerWei, defaultEtmPerBTC });

    await deployer.deploy(SafeMath);
    await deployer.link(SafeMath, Fundraiser);
    await deployer.deploy(Fundraiser, admin, treasury, /*beginBlock, endBlock,*/ btcPerWei, defaultEtmPerBTC);
  });
};
