var accounts = web3.eth.accounts;
console.log("ACCOUNTS", accounts);

var SafeMath = artifacts.require('./SafeMath.sol');
var Fundraiser = artifacts.require("./Fundraiser.sol");

var periodBlocks = 400000;
var beginBlockIn = 0;

var blockNum = web3.eth.blockNumber;
var admin = '0x00a329c0648769A73afAc7F9381E08FB43dBEA72'; /*'0xf982f6ac73a26e243b7d26e0388b104817f75933';*/ //accounts[0];
var treasury = '0xf982f6ac73a26e243b7d26e0388b104817f75933'; /*'0x00f4B0B2dAA304636eB4965053EFC04FBc6429F8';*/ //accounts[1];
var beginBlock = blockNum + beginBlockIn;
var endBlock = beginBlock + periodBlocks;
var btcPerWei = web3.toWei(1/0.08145613, "ether");
var defaultEtmPerBTC = 5000;

web3.personal.unlockAccount("0x00a329c0648769A73afAc7F9381E08FB43dBEA72", "1", 15000);

module.exports = function(deployer) {
  console.log("Height before deployment", blockNum);
  console.log({ admin, treasury, monitor, beginBlock, endBlock, btcPerWei, defaultEtmPerBTC });

  deployer.deploy(SafeMath);
  deployer.link(SafeMath, Fundraiser);
  deployer.deploy(Fundraiser, admin, treasury, beginBlock, endBlock, btcPerWei, defaultEtmPerBTC);
};
