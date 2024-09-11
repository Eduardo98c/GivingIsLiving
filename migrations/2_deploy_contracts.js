var Donazione = artifacts.require("Donazione");

// Dopo aver ottenuto il contratto compilato con artifacts.require,
// viene deployato su una rete: network con il possessore accounts[i] 
module.exports = function(deployer, network, accounts) {

  deployer.deploy(Donazione, {from: accounts[0]});
};
