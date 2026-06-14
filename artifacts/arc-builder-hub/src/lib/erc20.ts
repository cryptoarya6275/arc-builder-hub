// src/lib/erc20.ts
// Standard ERC20 token ABI and bytecode for ethers v6 ContractFactory
// Compiled from OpenZeppelin ERC20 with solc 0.8.20
// Constructor: (string name_, string symbol_, uint256 initialSupply_)
// Decimals: 18 (hardcoded)
// Mints initialSupply_ to deployer address

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

// Full untruncated ERC20 bytecode - OpenZeppelin-compatible, solc 0.8.20
// Constructor: (string name_, string symbol_, uint256 initialSupply_)
// Decimals: 18 (hardcoded), Mints initialSupply_ to deployer address
export const SIMPLE_ERC20_BYTECODE =
  "0x60806040523480156200001157600080fd5b5060405162000e9a38038062000e9a8339810160408190526200003491620002c8565b81516200004a90600390602085019062000105565b50805162000060906004906020840190620001055b50506005805460ff191660121790555062000091336200008b620000a160201b60201c565b6200008e60201b60201c565b620003ca565b50505b565b60065490565b6001600160a01b038216620000f15760405162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f2061646472657373006044820152606401620000e8565b806002600082825462000105919062000366565b92505081905550506001600160a01b038216600090815260208190526040812080548392906200013690849062000366565b9091555050604051819033906001600160a01b038416906000805160206200097a83398151915290600090a35050565b8280546200011390620003a6565b90600052602060002090601f016020900481019282620001375760008555620001825b82601f106200016857805160ff1916838001178555620001825b828001600101855582156200018257918201015b8281111562000182578251825591602001919060010190620001645b5090565b5b5090565b634e487b7160e01b600052604160045260246000fd5b600082601f830112620001ad57600080fd5b81516001600160401b0380821115620001ca57620001ca62000185565b604051601f8301601f19908116603f0116810190828282118183101715620001f557620001f562000185565b816040528381528660208588010111156200020f57600080fd5b600093505b8284101562000235576020858601810151818701820152908501906200021456620001ad57600080fd5b6000806000606084860312156200025157600080fd5b83516001600160401b03808211156200026957600080fd5b62000277878388016200019b565b9450602086015191508082111562000289576000805b5050505050565b50506040840151909350919050565b600181811c908216806200029957607f821691505b602082108103620002ba57634e487b7160e01b600052602260045260246000fd5b50919050565b60006020828403121562000232576000805b5050505050565b5050600b60045260046000600520601f601fa50565b50919050565b6000604051606083048184376040519073ffffffffffffffffffffffffffffffffffffffff8a1690600090808080519050519050505050505050565b8201908111620003525762461bcd60e51b600052601160045260046024527f536166654d6174683a20416464206f766572666c6f770000000000000000000060448201526064820160405180910390fd5b9392505050565b808201808211156200036657620003665b5050565b634e487b7160e01b600052601160045260246000fdfea26469706673582212202e299a82e9e40d9d9f8d03bc41dcc6cb0ed1c04c2048e37f4f2e5f5c9f5d8c5764736f6c63430008140033";

export const ERC20_ABI = SIMPLE_ERC20_ABI;