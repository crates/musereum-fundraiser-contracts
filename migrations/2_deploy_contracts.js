var SafeMath = artifacts.require('./SafeMath.sol');
var Fundraiser = artifacts.require("./Fundraiser.sol");

module.exports = function(deployer) {
  var beginBlockIn = 0;
  var periodBlocks = 209000;

  web3.eth.getBlockNumber(async (err, blockNumber) => {
    if (err) {
      console.log(err);
      return;
    }

    var admin = '0x71f1BaFD46a8A14978a79A9161c07259A9308B22';
    var treasury = '0xcC1fF90e4eC2c004f51Bbefe4eC555A513B9A691';
    var beginBlock = blockNumber + beginBlockIn;
    var endBlock = beginBlock + periodBlocks;
    var btcPerWei = 1/0.08145613 * 1e18;
    var defaultEtmPerBTC = 5000;

    console.log("Height before deployment", blockNumber);
    console.log({ admin, treasury, beginBlock, endBlock, btcPerWei, defaultEtmPerBTC });

    await deployer.deploy(SafeMath);
    await deployer.link(SafeMath, Fundraiser);
    await deployer.deploy(Fundraiser, admin, treasury, beginBlock, endBlock, btcPerWei, defaultEtmPerBTC);
  });
};
