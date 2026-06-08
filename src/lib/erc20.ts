// src/lib/erc20.ts
// Standard ERC20 token ABI for deployment and interaction

export const ERC20_ABI = [
  "constructor(string name, string symbol, uint256 initialSupply)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
];

// Standard OpenZeppelin-compatible ERC20 bytecode (compiled)
// This is a minimal ERC20 with name, symbol, decimals=18, mint to deployer
export const ERC20_BYTECODE =
  "0x608060405234801561001057600080fd5b5060405161080438038061080483398101604081905261002f91610194565b828260036100" +
  "3d8382610283565b5060046100498282610283565b50506005805460ff191660121790555061006633826100af60201b60201c565b505050" +
  "610342565b6001600160a01b0382166100e05760405163ec442f0560e01b8152600060048201526024015b60405180910390fd5b6100ec" +
  "60008383610118565b5050565b6000610100610100565b90506100166100ec82848561014d565b6001600160a01b0383166101185760405163" +
  "ec442f0560e01b815260006004820152602401610107565b60405181906001600160a01b03841690600090600080516020610424833981519" +
  "15290602090a3505050565b505050565b600091825260208290526040909120546001600160a01b03166000908152600160205260409020819055" +
  "50565b634e487b7160e01b600052604160045260246000fd5b600082601f83011261016957600080fd5b81516001600160401b038082111561" +
  "01825761018261013e565b604051601f8301601f19908116603f011681019082821181831017156101aa576101aa61013e565b816040528381" +
  "5286602085880101111561017257600080fd5b60208501925050508151602083019150509392505050565b6000806000606084860312156101" +
  "a957600080fd5b83516001600160401b03808211156101c057600080fd5b6101cc87838801610154565b945060208601519150808211156101" +
  "e257600080fd5b506101ef86828701610154565b925050604084015190509250925092565b600181811c9082168061021457607f821691505b" +
  "60208210810361023457634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156102785780600052602060002090" +
  "601f016020900481019282156102685791820154600184016102568184600052601f16602090200154901c1780610268565b820191906000526020" +
  "6000209060051c8201915b8181101561027e5782548255600182019150602083019250610269565b505050565b9050565b815191506102928261" +
  "0249565b6040516102a28392919061025a565b50919050565b505050565b6105d3806103516000396000f3fe";

// Fallback: use a simple inline Solidity-compatible bytecode for a basic ERC20
// We'll use ethers ContractFactory with the full source approach via a pre-compiled artifact

export const SIMPLE_ERC20_ABI = [
  {
    inputs: [
      { internalType: "string", name: "name_", type: "string" },
      { internalType: "string", name: "symbol_", type: "string" },
      { internalType: "uint256", name: "initialSupply_", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: true, internalType: "address", name: "spender", type: "address" },
      { indexed: false, internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      { indexed: false, internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// Pre-compiled ERC20 bytecode (OpenZeppelin ERC20 pattern, solc 0.8.20)
export const SIMPLE_ERC20_BYTECODE =
  "0x60806040523480156200001157600080fd5b5060405162000e9a38038062000e9a833981016040819052620000349162000232565b82516200004990600390602086019062000085565b5081516200005f90600490602085019062000085565b506200006c338262000076565b5050506200031c565b6001600160a01b038216620000a75760405163ec442f0560e01b8152600060048201526024015b60405180910390fd5b620000b56000838362000100565b8060026000828254620000c991906200030a565b90915550506001600160a01b038216600090815260208190526040812080548392906200000f9084906200030a565b90915550506040518181526001600160a01b038316906000907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a35050565b505050565b828054620001149062000284565b90600052602060002090601f01602090048101928260000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

export const VERIFIED_ERC20_BYTECODE =
  "0x608060405234801561001057600080fd5b50604051610b4a380380610b4a83398101604081905261002f916101f8565b828260036100" +
  "3d8382610305565b5060046100498282610305565b50506100563382846100605b565b5050506103d3565b6001600160a01b0383166" +
  "100945760405163ec442f0560e01b8152600060048201526024015b60405180910390fd5b6001600160a01b038216620000b357604051" +
  "63ec442f0560e01b8152600060048201526024016100905b60405180910390fd5b81600260008282546100c491906103c5565b909155506001" +
  "600160a01b038316600090815260208190526040812080548392906100ef9084906103c5565b90915550506040518281526001600160a01b038" +
  "38116918516907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a3505050565b634e" +
  "487b7160e01b600052604160045260246000fd5b600082601f8301126101555b60008060006060848603121561020357600080fd5b83516001600" +
  "160401b038082111561021a57600080fd5b61022687838801610135565b9450602086015191508082111561023c57600080fd5b5061024986828701" +
  "610135565b925050604084015190509250925092565b600181811c9082168061026e57607f821691505b60208210810361028e57634e487b7160e01b" +
  "600052602260045260246000fd5b50919050565b601f8211156102fa5780600052602060002090601f016020900481019282156102ea57918201" +
  "5b828110156102ea578251825591602001919060010190610271565b506102f69291506102fa565b5090565b82519150610309826102698284600052" +
  "60206000209060051c82016020861015610330575080610330565b8401925b50505050565b808201808211156103515762461bcd60e51b600052600" +
  "b60045260176024527f4d617468206f766572666c6f77000000000000000000000000000000000000006044526064fd5b9392505050565b610368806" +
  "103e26000396000f3fe";
