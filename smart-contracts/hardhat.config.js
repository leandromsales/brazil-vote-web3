require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("@nomicfoundation/hardhat-network-helpers");
require("hardhat-abi-exporter");
require("hardhat-contract-sizer");
require("hardhat-deploy");
require('hardhat-ethernal');
require("hardhat-ignore-warnings");
require("hardhat-tracer");
require("solidity-coverage");
//require("@openzeppelin/hardhat-upgrades");
require("@typechain/hardhat");


require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // defaultNetwork: "sepolia",
  // defaultNetwork: "localhost",
  namedAccounts: { deployer: { default: 0 } },
  defaultNetwork: "hardhat",
  networks: {
    // Local development network
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    
    // Sepolia testnet
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      loggingEnabled: true,
      gas: 6000000,
      gasPrice: 20000000000,
    },
    
    // Ethereum mainnet (use with caution)
    mainnet: {
      url: process.env.MAINNET_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1,
    },

    hardhat: {
      chainId: 31337,
      ...(process.env.MAINNET_RPC_URL
        ? { forking: { url: process.env.MAINNET_RPC_URL } }
        : {}
      ),
      accounts: [
        {
          privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", 
          balance: "10000000000000000000000" // em wei, ex: 10000 ETH
        },
        {
          privateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
          balance: "10000000000000000000000"
        },
        {
          privateKey: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
          balance: "10000000000000000000000"
        },
        {
          privateKey: "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
          balance: "10000000000000000000000"
        },
        {
          privateKey: "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba",
          balance: "10000000000000000000000"
        }
      ]
    }
  },

  // Solidity compiler configuration
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  
  // Etherscan API key for contract verification
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  
  // Gas reporter configuration
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  
  // Mocha test configuration
  mocha: {
    timeout: 40000,
  },

  ethernal: {
    apiToken: process.env.ETHERNAL_API_TOKEN
  },

  contractSizer: {
    runOnCompile: true,
    strict: true
  },

  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6" 
  },

  abiExporter: [{
    path: "./abi",
    clear: true,
    runOnCompile: true,
    spacing: 2
  }],

  /*
  warnings: {
    "*": "off"
  },

  ignoreWarnings: [
    "Function state mutability can be restricted to view",
    "Unused local variable",
    "This contract has a payable fallback function but no receive ether function. Consider adding a receive ether function.",
    "This contract's fallback function is not payable but the contract can still receive ether. Consider making the fallback function payable or adding a receive ether function."
  ] 
  */
};
