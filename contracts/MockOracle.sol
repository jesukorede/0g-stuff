// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockOracle
 * @dev A mock oracle contract for testing INFT authorization
 */
contract MockOracle is Ownable {
    // Mapping to store authorized inference requests
    mapping(bytes32 => bool) public authorizedRequests;
    
    // Events
    event RequestAuthorized(bytes32 indexed requestId, address indexed requester, uint256 indexed tokenId);
    event RequestExecuted(bytes32 indexed requestId, bool success);
    
    /**
     * @dev Constructor initializes the MockOracle contract
     * @param initialOwner Initial owner of the contract
     */
    constructor(address initialOwner) Ownable(initialOwner) {}
    
    /**
     * @dev Authorizes an inference request
     * @param requester Address requesting inference
     * @param tokenId ID of the INFT token
     * @param timestamp Timestamp of the request
     * @return requestId The generated request ID
     */
    function authorizeRequest(
        address requester,
        uint256 tokenId,
        uint256 timestamp
    ) public returns (bytes32) {
        bytes32 requestId = keccak256(abi.encodePacked(requester, tokenId, timestamp));
        authorizedRequests[requestId] = true;
        emit RequestAuthorized(requestId, requester, tokenId);
        return requestId;
    }
    
    /**
     * @dev Executes an inference request
     * @param requestId ID of the request to execute
     * @return bool True if the request was executed successfully
     */
    function executeRequest(bytes32 requestId) public returns (bool) {
        require(authorizedRequests[requestId], "MockOracle: Request not authorized");
        authorizedRequests[requestId] = false;
        emit RequestExecuted(requestId, true);
        return true;
    }
    
    /**
     * @dev Checks if a request is authorized
     * @param requestId ID of the request to check
     * @return bool True if the request is authorized
     */
    function isAuthorized(bytes32 requestId) public view returns (bool) {
        return authorizedRequests[requestId];
    }
}