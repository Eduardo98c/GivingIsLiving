// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;


import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/PullPayment.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";


contract Donazione is Ownable, PullPayment{
     
   uint256 private amount;
   address private Owner;
   
   address payable [] enti;
   
   mapping(address => uint256) donations;
   
   
   // Mutex settato inizialmente a false per permettere l'utilizzo del contratto  
   bool mutexCompleted = false;
   
   // Setto l'Owner del contratto
   constructor() {
        Owner = msg.sender;
   }
   
   
   function isOwner() internal view returns(bool) {
      return owner() == msg.sender; 
   }
  
   // Funzione per il trasferimento dei permessi di Owner
   function change_owner(address newOwner) public onlyOwner returns (address){
      _transferOwnership(newOwner);
      return newOwner;
   }
   
   // Evento per la donazione effettuata
   event donazione_effettuata(uint256 transaction);
   
   
   // Funzione donazione disponibile solo al creatore (donatore) del contratto con la funzione di sicurezza onlyOwner
   function nuovaDonazione(address utente, address payable ente) public payable onlyOwner returns (address) {
      
      require(msg.sender == Owner, "Solo il proprietario puo' lanciare il contratto"); 
      require(msg.value > 0, "Fondi insufficienti");
      require(!mutexCompleted, "Il contratto e' gia' stato completato");
      
      bool success;
     
      (success, donations[utente]) = SafeMath.tryAdd(donations[utente], msg.value); 
      enti.push(ente);
         
      /* 
         Utilizzo di _asyncTransfer così che i fondi inviati in questo modo vengono immagazzinati in un 
         contratto Escrow intermedio, quindi non c'è pericolo che vengano spesi prima del prelievo. 
      */
      //_asyncTransfer(ente, donations[utente]);      
      
      completa_contratto();
      
      ente.transfer(donations[utente]);
      
      (success, amount) = SafeMath.tryAdd(amount, donations[utente]); 
      
      
      emit donazione_effettuata(donations[utente]);
      
      return msg.sender;             
   }
  
   // Funzione per completamento del contratto (effettuabile solo dal suo possessore(donatore))
   function completa_contratto() internal onlyOwner{   
      // Flag mutex per concludere definitivamente il contratto
      mutexCompleted = true;
   }
   
   // Funzione necessaria per far ricevere al contratto pagamenti in ETH (payable) da un utente esterno (external)
   receive() external payable{}
       
   // Ritorna ammontare di donazioni del contratto
   function getAmount() public view returns (uint256) {
        return amount;
   }
  
}
