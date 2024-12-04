module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",    // Adresse locale de Ganache
      port: 7545,           // Port par défaut de Ganache
      network_id: "*",      // Accepter tous les IDs de réseau
    },
  },
  compilers: {
    solc: {
      version: "0.8.17",    // Spécifiez la version de Solidity
    },
  },
};
