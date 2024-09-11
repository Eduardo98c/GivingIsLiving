App = {
  
  web3Provider: null,
  contracts: {},
  entitiesRow: null, 
  
  init: async function() {
  
      // Carico le entità da enti.json per il caricamento pagina html
      $.getJSON('../enti.json', function(data) {
      entitiesRow = $('#entitiesRow');
      entityTemplate = $('#entityTemplate');

         for (i = 0; i < data.length; i ++) {
            
            entityTemplate = entityTemplate.clone();
            
            entityTemplate.find('.panel-title').text(data[i].name);
            entityTemplate.find('img').attr('src', data[i].logo);
            entityTemplate.find('.entity-name').text(data[i].name);
            entityTemplate.find('.entity-mission').text(data[i].mission);
            entityTemplate.find('.entity-location').text(data[i].location);
            entityTemplate.find('.entity-publicKey').text(data[i].publicKey);
            entityTemplate.find('.btn-send-money').attr('data-id', data[i].id);
            entityTemplate.find('.entity-ethereum-amount').attr('data-id', data[i].id);
            
         
            entitiesRow.append(entityTemplate.html());
         }

      });

      return await App.initWeb3();
  },
  
  // Inizializza web3 per il provider web su rete "http://localhost:7545" (ethereum)
  initWeb3: async function() {
     
     // Modern dapp browsers...
     if (window.ethereum) {
           App.web3Provider = window.ethereum;
        try {
           // Request account access
           await eth_requestAccounts();
        } 
        catch (error) {
           // User denied account access...
           console.error("User denied account access")
        }
     }
     // Legacy dapp browsers...
     else if (window.web3) {
        App.web3Provider = window.web3.currentProvider;
     }
     // If no injected web3 instance is detected, fall back to Ganache
     else {
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
     }
          
     web3 = new Web3(App.web3Provider);
     
    
    return App.initContract();
  },
  
  // Inizializzo il contratto partendo dal contratto compilato
  initContract: function() {
     
     $.getJSON('Donazione.json', function(data) {
     
        // Get the necessary contract artifact file and instantiate it with @truffle/contract
        var DonazioneArtifact = data;
        App.contracts.Donazione = TruffleContract(DonazioneArtifact);

        // Set the provider for our contract
        App.contracts.Donazione.setProvider(App.web3Provider);
       
     });

     return App.bindEvents();
  },
   
  // Attesa dell'evento di click sul pulsante "Dona denaro" di classe '.btn-send-money'
  bindEvents: function() {
     
     $(document).on('click', '.btn-send-money', App.handleDona);
  },

  // Funzione effettuata al click del pulsante "Dona denaro" per inviare denaro,
  // completare la transazione e terminare il contratto deployato
  handleDona: function(event) {
       
     event.preventDefault();
           
     var id_ente = parseInt($(event.target).data('id'));
   
     //var indirizzo_ente = ($(event.target).data('publicKey'));
     var indirizzo_ente = null;     
     var amount = null;
     
     $.getJSON('../enti.json', function(data) {
     
        for (var i = 0; i < data.length; i++) {
           if (data[i].id == id_ente) {
              
              console.log("id_ente: ", id_ente);
              indirizzo_ente = data[i].publicKey;
              
              //Estraggo valore dal campo di input (Donazione(ETH))
              amount = entitiesRow.find('.entity-ethereum-amount')[id_ente].value;
              break;
           }
           
        } //endFor
        
        console.log("indirizzo ente: "+indirizzo_ente);
        var amount = amount;    
     
        if (isNaN(amount)) {
           alert("Inserisci un valore numerico valido");
        } 
        else {
           console.log("valore: "+ amount);
           amount = parseFloat(amount);
           
           // Conversione valore da Ether a Wei
           amount = web3.toWei(amount, "ether");
        }
        var donazioneInstance;
        
        //web3.eth.getAccounts(function(error, accounts) {
        window.ethereum.enable().then(function(accounts){
       
           // Ottenere l'indirizzo del wallet creato dall'utente
           var account = accounts[0];
        
           console.log("indirizzo utente: "+ account);
            
           App.contracts.Donazione.deployed().then(function(instance) {
             
              donazioneInstance = instance;
                   
	          // Execute dona as a transaction by sending account
              return donazioneInstance.nuovaDonazione(account, indirizzo_ente,{from: account, value: amount});
    
           }).then(function(result) {
   
              console.log("Transazione completata");
    
           }).catch(function(err) {
              console.log(err.message);
           });
        
        }) //end window.ethereum.enable()

     }) //end getJSON
  
  } //end handleDona

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
