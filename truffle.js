var ethereumjsWallet = require('ethereumjs-wallet');

var bip39 = require("bip39");
var hdkey = require('ethereumjs-wallet/hdkey');

var ProviderEngine = require("web3-provider-engine");
var FilterSubprovider = require('web3-provider-engine/subproviders/filters.js')
var WalletSubprovider = require('web3-provider-engine/subproviders/wallet.js');
var Web3Subprovider = require("web3-provider-engine/subproviders/web3.js");
var Web3 = require("web3");

var web3 = new Web3();

//
// Ropsten
//
// Get our mnemonic and create an hdwallet
var mnemonic = "ensure chimney canvas vibrant exit goddess spring tell question height obvious dinner subway coast mistake";
var hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic));

// Get the first account using the standard hd path.
var wallet_hdpath = "m/44'/60'/0'/0/";
var wallet = hdwallet.derivePath(wallet_hdpath + "0").getWallet();
var address = "0x" + wallet.getAddress().toString("hex");

var providerUrl = "https://ropsten.infura.io/I7ZYLQyyy8bcLAjafPbg";
var engine = new ProviderEngine();
engine.addProvider(new FilterSubprovider())
engine.addProvider(new WalletSubprovider(wallet, {}));
engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(providerUrl)));
// network connectivity error
engine.on('error', function(err) {
    // report connectivity errors
    console.error(err.stack)
})
engine.start(); // Required by the provider engine.

//
// Ethereum
//
// create wallet from existing private key
var privateKeyMain = process.env.PRIVATE_KEY_MAIN;
var walletMain = ethereumjsWallet.fromPrivateKey(new Buffer(privateKeyMain, "hex"));
var addressMain = "0x" + walletMain.getAddress().toString("hex");
// using ropsten testnet
var providerUrlMain = "https://mainnet.infura.io/I7ZYLQyyy8bcLAjafPbg";
var engineMain = new ProviderEngine();
// filters
engineMain.addProvider(new FilterSubprovider());
engineMain.addProvider(new WalletSubprovider(walletMain, {}));
engineMain.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(providerUrlMain)));
engineMain.start(); // Required by the provider engine.

//
// Ethereum Classic
//
// create wallet from existing private key
var privateKeyClassic = process.env.PRIVATE_KEY_CLASSIC;
var walletClassic = ethereumjsWallet.fromPrivateKey(new Buffer(privateKeyClassic, "hex"));
var addressClassic = "0x" + walletClassic.getAddress().toString("hex");
// using ropsten testnet
var providerUrlClassic = "https://tokensale.musereum.org/etc/";
var engineClassic = new ProviderEngine();
// filters
engineClassic.addProvider(new FilterSubprovider());
engineClassic.addProvider(new WalletSubprovider(walletClassic, {}));
engineClassic.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(providerUrlClassic)));
engineClassic.start(); // Required by the provider engine.

console.log('addressMain: ', addressMain);
console.log('addressClassic: ', addressClassic);

module.exports = {
  networks: {
    "ropsten": {
      network_id: 3,    // Official ropsten network id
      provider: engine, // Use our custom provider
      from: address,    // Use the address we derived
      gas: 4500000,
      gasPrice: web3.toWei(20, 'gwei'),
    },
    "main": {
      network_id: 1,    // Official network id
      provider: engineMain, // Use our custom provider
      from: addressMain,    // Use the address we derived
      gas: 4000000,
      gasPrice: web3.toWei(20, 'gwei'),
    },
    "classic": {
      network_id: 61,    // Official network id
      provider: engineClassic, // Use our custom provider
      from: addressClassic,    // Use the address we derived
      gas: 4300000,
      gasPrice: web3.toWei(20, 'gwei'),
    },
    "development": {
      host: "localhost",
      port: 8545,
      network_id: "*",
    }
  }
};