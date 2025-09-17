// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title INFT (Intelligent NFT)
 * @dev ERC721 token with additional functionality for AI agent authorization and metadata management
 */
contract INFT is ERC721URIStorage, Ownable {
    using ECDSA for bytes32;

    // Oracle contract address for verifying transfer authorizations
    address public oracleAddress;
    
    // Mapping from token ID to authorized addresses
    mapping(uint256 => mapping(address => bool)) private _authorizedUsers;
    
    // Mapping from token ID to metadata encryption keys (encrypted with owner's public key)
    mapping(uint256 => string) private _encryptedMetadataKeys;
    
    // Mapping from token ID to agent type
    mapping(uint256 => string) private _agentTypes;
    
    // Events
    event AgentMinted(uint256 indexed tokenId, address indexed owner, string agentType);
    event AuthorizationGranted(uint256 indexed tokenId, address indexed user);
    event AuthorizationRevoked(uint256 indexed tokenId, address indexed user);
    event MetadataUpdated(uint256 indexed tokenId);
    
    /**
     * @dev Constructor initializes the INFT contract
     * @param name Name of the NFT collection
     * @param symbol Symbol of the NFT collection
     * @param initialOwner Initial owner of the contract
     * @param _oracleAddress Address of the oracle contract for authorization verification
     */
    constructor(
        string memory name,
        string memory symbol,
        address initialOwner,
        address _oracleAddress
    ) ERC721(name, symbol) Ownable(initialOwner) {
        oracleAddress = _oracleAddress;
    }
    
    /**
     * @dev Mints a new INFT with the given metadata
     * @param to Address to mint the token to
     * @param tokenId ID of the token to mint
     * @param tokenURI URI of the token metadata
     * @param encryptedMetadataKey Encrypted metadata key (encrypted with owner's public key)
     * @param agentType Type of AI agent represented by this INFT
     */
    function mint(
        address to,
        uint256 tokenId,
        string memory tokenURI,
        string memory encryptedMetadataKey,
        string memory agentType
    ) public onlyOwner {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        _encryptedMetadataKeys[tokenId] = encryptedMetadataKey;
        _agentTypes[tokenId] = agentType;
        
        // Automatically authorize the owner
        _authorizedUsers[tokenId][to] = true;
        
        emit AgentMinted(tokenId, to, agentType);
    }
    
    /**
     * @dev Batch mints multiple INFTs
     * @param to Array of addresses to mint tokens to
     * @param tokenIds Array of token IDs to mint
     * @param tokenURIs Array of token URIs
     * @param encryptedMetadataKeys Array of encrypted metadata keys
     * @param agentTypes Array of agent types
     */
    function batchMint(
        address[] memory to,
        uint256[] memory tokenIds,
        string[] memory tokenURIs,
        string[] memory encryptedMetadataKeys,
        string[] memory agentTypes
    ) public onlyOwner {
        require(
            to.length == tokenIds.length &&
            tokenIds.length == tokenURIs.length &&
            tokenURIs.length == encryptedMetadataKeys.length &&
            encryptedMetadataKeys.length == agentTypes.length,
            "INFT: Array lengths must match"
        );
        
        for (uint256 i = 0; i < to.length; i++) {
            mint(to[i], tokenIds[i], tokenURIs[i], encryptedMetadataKeys[i], agentTypes[i]);
        }
    }
    
    /**
     * @dev Grants authorization to use the INFT to a specific address
     * @param tokenId ID of the token to authorize
     * @param user Address to authorize
     */
    function grantAuthorization(uint256 tokenId, address user) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "INFT: Caller is not owner nor approved");
        _authorizedUsers[tokenId][user] = true;
        emit AuthorizationGranted(tokenId, user);
    }
    
    /**
     * @dev Revokes authorization from a specific address
     * @param tokenId ID of the token to revoke authorization for
     * @param user Address to revoke authorization from
     */
    function revokeAuthorization(uint256 tokenId, address user) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "INFT: Caller is not owner nor approved");
        _authorizedUsers[tokenId][user] = false;
        emit AuthorizationRevoked(tokenId, user);
    }
    
    /**
     * @dev Checks if an address is authorized to use the INFT
     * @param tokenId ID of the token to check authorization for
     * @param user Address to check authorization for
     * @return bool True if the address is authorized, false otherwise
     */
    function isAuthorized(uint256 tokenId, address user) public view returns (bool) {
        return _authorizedUsers[tokenId][user] || _isApprovedOrOwner(user, tokenId);
    }
    
    /**
     * @dev Updates the metadata URI for a token
     * @param tokenId ID of the token to update
     * @param newTokenURI New URI for the token metadata
     * @param newEncryptedMetadataKey New encrypted metadata key
     */
    function updateMetadata(
        uint256 tokenId,
        string memory newTokenURI,
        string memory newEncryptedMetadataKey
    ) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "INFT: Caller is not owner nor approved");
        _setTokenURI(tokenId, newTokenURI);
        _encryptedMetadataKeys[tokenId] = newEncryptedMetadataKey;
        emit MetadataUpdated(tokenId);
    }
    
    /**
     * @dev Gets the encrypted metadata key for a token
     * @param tokenId ID of the token to get the encrypted metadata key for
     * @return string The encrypted metadata key
     */
    function getEncryptedMetadataKey(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "INFT: Query for nonexistent token");
        require(_isApprovedOrOwner(msg.sender, tokenId), "INFT: Caller is not owner nor approved");
        return _encryptedMetadataKeys[tokenId];
    }
    
    /**
     * @dev Gets the agent type for a token
     * @param tokenId ID of the token to get the agent type for
     * @return string The agent type
     */
    function getAgentType(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "INFT: Query for nonexistent token");
        return _agentTypes[tokenId];
    }
    
    /**
     * @dev Sets the oracle address
     * @param _oracleAddress New oracle address
     */
    function setOracleAddress(address _oracleAddress) public onlyOwner {
        oracleAddress = _oracleAddress;
    }
    
    /**
     * @dev Override for _update to handle authorization transfers
     */
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = super._update(to, tokenId, auth);
        
        // If this is a transfer (not a mint), revoke all authorizations except for the new owner
        if (from != address(0)) {
            _authorizedUsers[tokenId][from] = false;
            _authorizedUsers[tokenId][to] = true;
        }
        
        return from;
    }
}