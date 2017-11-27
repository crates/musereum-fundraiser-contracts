var bip39 = require("bip39");
var hdkey = require('ethereumjs-wallet/hdkey');
var ProviderEngine = require("web3-provider-engine");
var FilterSubprovider = require('web3-provider-engine/subproviders/filters.js')
var WalletSubprovider = require('web3-provider-engine/subproviders/wallet.js');
var Web3Subprovider = require("web3-provider-engine/subproviders/web3.js");

var Web3 = require("web3");

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

module.exports = {
  networks: {
    "ropsten": {
      network_id: 3,    // Official ropsten network id
      provider: engine, // Use our custom provider
      from: address,    // Use the address we derived
      //gas: 4712388,
      gasPrice: 250000000000,
    },
    "development": {
      host: "localhost",
      port: 8545,
      network_id: "*",
    }
  }
};