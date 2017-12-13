var SafeMath = artifacts.require('./SafeMath.sol');
var Fundraiser = artifacts.require("./Fundraiser.sol");

module.exports = function(deployer, network) {
  //var beginBlockIn = 0;
  var defaultEtmPerBTC = 50000;

  console.log(`Current network: ${network} `)
  if (network == 'main') {
    var admin = '0x3C878283Da027e7bc8e9c04c23Faa4f02cAFdCd9';
    var treasury = '0x3C20415875661dbe7669C46e89c13EeB2359E9f9';
    var btcPerWei = 1/0.04389213 * 1e18; // change
    //var periodBlocks = 209000; // change
  } else if (network == 'classic') {
    var admin = '0x3C878283Da027e7bc8e9c04c23Faa4f02cAFdCd9';
    var treasury = '0x3c6fd5B5901dF04e844E6d0d6DA5771BC1C57509';
    var btcPerWei = 1/0.00246100 * 1e18; // change
    //var periodBlocks = 209000; // change
  } else if (network == 'ropsten')  {
    var admin = '0x71f1BaFD46a8A14978a79A9161c07259A9308B22';
    var treasury = '0xcC1fF90e4eC2c004f51Bbefe4eC555A513B9A691';
    var btcPerWei = 1/0.00246100 * 1e18; // change
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
