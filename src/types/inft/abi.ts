import { InterfaceAbi } from 'ethers';

// Define the INFT contract ABI based on the contract functions
export const INFT_ABI: InterfaceAbi = [
  // ERC721 standard functions
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function safeTransferFrom(address from, address to, uint256 tokenId)',
  'function transferFrom(address from, address to, uint256 tokenId)',
  'function approve(address to, uint256 tokenId)',
  'function getApproved(uint256 tokenId) view returns (address)',
  'function setApprovalForAll(address operator, bool approved)',
  'function isApprovedForAll(address owner, address operator) view returns (bool)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function totalSupply() view returns (uint256)',
  
  // INFT specific functions
  'function mint(address to, uint256 tokenId, string memory tokenURI, string memory encryptedMetadataKey, string memory agentType)',
  'function batchMint(address[] memory to, uint256[] memory tokenIds, string[] memory tokenURIs, string[] memory encryptedMetadataKeys, string[] memory agentTypes)',
  'function grantAuthorization(uint256 tokenId, address user)',
  'function revokeAuthorization(uint256 tokenId, address user)',
  'function isAuthorized(uint256 tokenId, address user) view returns (bool)',
  'function updateMetadata(uint256 tokenId, string memory newTokenURI, string memory newEncryptedMetadataKey)',
  'function getEncryptedMetadataKey(uint256 tokenId) view returns (string)',
  'function getAgentType(uint256 tokenId) view returns (string)',
  'function setOracleAddress(address _oracleAddress)',
  'function oracleAddress() view returns (address)',
  
  // Events
  'event AgentMinted(uint256 indexed tokenId, address indexed owner, string agentType)',
  'event AuthorizationGranted(uint256 indexed tokenId, address indexed user)',
  'event AuthorizationRevoked(uint256 indexed tokenId, address indexed user)',
  'event MetadataUpdated(uint256 indexed tokenId)'
];

// Define the MockOracle contract ABI
export const ORACLE_ABI: InterfaceAbi = [
  'function authorizeRequest(address requester, uint256 tokenId, uint256 timestamp) returns (bytes32)',
  'function executeRequest(bytes32 requestId) returns (bool)',
  'function authorizedRequests(bytes32 requestId) view returns (bool)',
  
  // Events
  'event RequestAuthorized(bytes32 indexed requestId, address indexed requester, uint256 indexed tokenId)',
  'event RequestExecuted(bytes32 indexed requestId, bool success)'
];