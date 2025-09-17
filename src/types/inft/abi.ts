import { parseAbi, type Abi } from 'viem'
import type { InterfaceAbi } from 'ethers'

// Human-readable ABI definitions
const INFT_ABI_HR = [
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
  'function mint(address to, uint256 tokenId, string tokenURI, string encryptedMetadataKey, string agentType)',
  'function batchMint(address[] to, uint256[] tokenIds, string[] tokenURIs, string[] encryptedMetadataKeys, string[] agentTypes)',
  'function grantAuthorization(uint256 tokenId, address user)',
  'function revokeAuthorization(uint256 tokenId, address user)',
  'function isAuthorized(uint256 tokenId, address user) view returns (bool)',
  'function updateMetadata(uint256 tokenId, string newTokenURI, string newEncryptedMetadataKey)',
  'function getEncryptedMetadataKey(uint256 tokenId) view returns (string)',
  'function getAgentType(uint256 tokenId) view returns (string)',
  'function setOracleAddress(address _oracleAddress)',
  'function oracleAddress() view returns (address)',
  
  // Events
  'event AgentMinted(uint256 indexed tokenId, address indexed owner, string agentType)',
  'event AuthorizationGranted(uint256 indexed tokenId, address indexed user)',
  'event AuthorizationRevoked(uint256 indexed tokenId, address indexed user)',
  'event MetadataUpdated(uint256 indexed tokenId)'
] as const

const ORACLE_ABI_HR = [
  'function authorizeRequest(address requester, uint256 tokenId, uint256 timestamp) returns (bytes32)',
  'function executeRequest(bytes32 requestId) returns (bool)',
  'function authorizedRequests(bytes32 requestId) view returns (bool)',
  
  // Events
  'event RequestAuthorized(bytes32 indexed requestId, address indexed requester, uint256 indexed tokenId)',
  'event RequestExecuted(bytes32 indexed requestId, bool success)'
] as const

// viem-compatible ABIs (for wagmi v2)
export const INFT_ABI: Abi = parseAbi(INFT_ABI_HR)
export const ORACLE_ABI: Abi = parseAbi(ORACLE_ABI_HR)

// ethers-compatible ABIs (for ethers.Contract)
export const INFT_ABI_ETHERS: InterfaceAbi = INFT_ABI as unknown as InterfaceAbi
export const ORACLE_ABI_ETHERS: InterfaceAbi = ORACLE_ABI as unknown as InterfaceAbi