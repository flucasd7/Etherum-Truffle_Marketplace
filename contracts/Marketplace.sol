// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Marketplace {
    struct Item {
        uint id;
        string name;
        uint price;
        string image;
        string description;
        address payable owner;
        bool sold;
    }

    uint public itemCount = 0;
    address public admin; // Adresse de l'administrateur
    mapping(uint => Item) public items;
    mapping(address => bool) public sellers; // Liste blanche des vendeurs

    event ItemListed(uint id, string name, uint price, string image, string description, address owner);
    event ItemPurchased(uint id, address buyer, uint price);
    event SellerAdded(address seller);

    // Initialisation de l'administrateur
    constructor() {
        admin = msg.sender; // Le déployeur est l'administrateur
    }

    // Fonction pour ajouter un vendeur (par l'administrateur uniquement)
    function addSeller(address _seller) public {
        require(msg.sender == admin, "Seul l'administrateur peut ajouter des vendeurs");
        sellers[_seller] = true;
        emit SellerAdded(_seller);
    }

    // Fonction pour lister un produit (seulement les vendeurs)
    function listItem(string memory _name, uint _price, string memory _image, string memory _description) public {
        require(sellers[msg.sender], "Vous n'etes pas autorise a lister des produits");
        require(_price > 0, "Le prix doit etre superieur a zero");
        itemCount++;
        items[itemCount] = Item(itemCount, _name, _price, _image, _description, payable(msg.sender), false);
        emit ItemListed(itemCount, _name, _price, _image, _description, msg.sender);
    }

    // Fonction pour acheter un produit
    function purchaseItem(uint _id) public payable {
        Item storage item = items[_id];
        require(!item.sold, "Ce produit a deja ete vendu");
        require(msg.value == item.price, "Montant incorrect");
        item.owner.transfer(item.price);
        item.sold = true;
        emit ItemPurchased(_id, msg.sender, item.price);
    }
}
