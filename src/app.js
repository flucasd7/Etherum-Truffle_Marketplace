let contract;
let accounts;
let products = []; // Stock temporaire des produits pour recherche et tri

// Initialiser Web3 et le contrat
async function init() {
    if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const contractABI = [ {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "id",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "name",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "price",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "image",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "description",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "ItemListed",
            "type": "event"
        },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "id",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "address",
                        "name": "buyer",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "price",
                        "type": "uint256"
                    }
                ],
                "name": "ItemPurchased",
                "type": "event"
            },
            {
                "inputs": [],
                "name": "itemCount",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function",
                "constant": true
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "name": "items",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "id",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "price",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "image",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "description",
                        "type": "string"
                    },
                    {
                        "internalType": "address payable",
                        "name": "owner",
                        "type": "address"
                    },
                    {
                        "internalType": "bool",
                        "name": "sold",
                        "type": "bool"
                    }
                ],
                "stateMutability": "view",
                "type": "function",
                "constant": true
            },
            {
                "inputs": [
                    {
                        "internalType": "string",
                        "name": "_name",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_price",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "_image",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "_description",
                        "type": "string"
                    }
                ],
                "name": "listItem",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_id",
                        "type": "uint256"
                    }
                ],
                "name": "purchaseItem",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function",
                "payable": true
            } ];
        const contractAddress = "0x2dD670E876477cc0921c3Af2Dc3D077F92470bD7";
        contract = new web3.eth.Contract(contractABI, contractAddress);
        await loadProducts();
    } else {
        alert("Veuillez installer Metamask !");
    }
}

// Ajouter un produit
async function addProduct() {
    const name = document.getElementById("product-name").value;
    const price = Web3.utils.toWei(document.getElementById("product-price").value, "ether");
    const image = document.getElementById("product-image").value;
    const description = document.getElementById("product-description").value;

    try {
        await contract.methods.listItem(name, price, image, description).send({ from: accounts[0] });
        await loadProducts();
    } catch (error) {
        console.error("Erreur lors de l'ajout du produit :", error);
    }
}

// Charger les produits
async function loadProducts() {
    const productList = document.getElementById("product-list");
    productList.innerHTML = "";

    const itemCount = await contract.methods.itemCount().call();
    products = []; // Réinitialisation des produits

    for (let i = 1; i <= itemCount; i++) {
        const item = await contract.methods.items(i).call();
        products.push(item);

        const productCard = document.createElement("div");
        productCard.className = "product-card";
        productCard.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>${Web3.utils.fromWei(item.price, "ether")} ETH</p>
            <p>${item.description}</p>
            ${item.sold ? "<button disabled>Vendu</button>" : `<button onclick="buyProduct(${i})">Acheter</button>`}
        `;
        productList.appendChild(productCard);
    }
}

// Acheter un produit
async function buyProduct(id) {
    const item = await contract.methods.items(id).call();
    try {
        await contract.methods.purchaseItem(id).send({
            from: accounts[0],
            value: item.price
        });
        await loadProducts();
        updateSalesHistory(id);
    } catch (error) {
        console.error("Erreur lors de l'achat :", error);
    }
}


// Mise à jour de l'historique des ventes
function updateSalesHistory(id) {
    const salesList = document.getElementById("sales-list");
    const item = products.find((product) => product.id === id);
    const salesItem = document.createElement("li");
    salesItem.textContent = `${item.name} - ${Web3.utils.fromWei(item.price, "ether")} ETH`;
    salesList.appendChild(salesItem);
}

// Fonction de recherche
function searchProducts() {
    const searchBar = document.getElementById("search-bar");
    const searchQuery = searchBar.value.toLowerCase();
    const filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchQuery));
    displayProducts(filteredProducts);
}

// Fonction de tri
function sortProducts() {
    const sortOption = document.getElementById("sort-options").value;
    let sortedProducts;
    if (sortOption === "name") {
        sortedProducts = [...products].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "price") {
        sortedProducts = [...products].sort((a, b) => parseInt(a.price) - parseInt(b.price));
    }
    displayProducts(sortedProducts);
}

// Affichage des produits
function displayProducts(filteredProducts) {
    const productList = document.getElementById("product-list");
    productList.innerHTML = "";

    filteredProducts.forEach(item => {
        const productCard = document.createElement("div");
        productCard.className = "product-card";
        productCard.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>${Web3.utils.fromWei(item.price, "ether")} ETH</p>
            <p>${item.description}</p>
            ${item.sold ? "<button disabled>Sold</button>" : `<button onclick="buyProduct(${item.id})">Buy</button>`}
        `;
        productList.appendChild(productCard);
    });
}

// Initialiser la page
document.addEventListener("DOMContentLoaded", init);
