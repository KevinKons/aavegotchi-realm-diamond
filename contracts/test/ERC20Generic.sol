// SPDX-License-Identifier: UNLICENSED
// © Copyright 2021. Patent pending. All rights reserved. Perpetual Altruism Ltd.
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title ERC20 Generic placeholder smart contract for testing and ABI
contract ERC20Generic is ERC20 {
  /// @notice Constructor
  /// @dev Please change the values in here if you want more specific values, or make the constructor takes arguments
  constructor() ERC20("Generic ERC20", "GEN20") {}

  /// @notice Mint _value tokens for msg.sender
  /// Function not present in ERC20 spec : allow for the minting of a token for test purposes
  /// @param _value Amount of tokens to mint
  function mint(uint256 _value) public {
    _mint(msg.sender, _value);
  }
}
