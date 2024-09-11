const Donazione = artifacts.require("Donazione");


// Creazione contratto di test per controllare gli esiti delle donazioni e gli eventuali problemi di sicurezza
contract("Donazione", async accounts => {

  it("dovrebbe creare una nuova donazione", async () => {
  
    await Donazione.deployed().then(function(instance) {
       
       newOwner = instance.change_owner(accounts[0]);
       console.log(newOwner);
       const expectedOwner = accounts[0];
       const enteId = "0xb8FC297234D4Df70184A86eD295428B1283e95e8";
       const denaroDonazione = web3.utils.toWei("10", "ether");

       
       return instance.nuovaDonazione(expectedOwner, enteId, { from: expectedOwner, value: denaroDonazione });
       
       
    }).then(function(ownerAddress) {
       console.log("Indirizzo proprietario del contratto Donazione:", ownerAddress);
    });
   
  });
});

