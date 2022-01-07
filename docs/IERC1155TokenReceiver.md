# IERC1155TokenReceiver





Note: The ERC-165 identifier for this interface is 0x4e2312e0.



## Methods

### onERC1155BatchReceived

```solidity
function onERC1155BatchReceived(address _operator, address _from, uint256[] _ids, uint256[] _values, bytes _data) external nonpayable returns (bytes4)
```

Handle the receipt of multiple ERC1155 token types.

*An ERC1155-compliant smart contract MUST call this function on the token recipient contract, at the end of a `safeBatchTransferFrom` after the balances have been updated.         This function MUST return `bytes4(keccak256(&quot;onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)&quot;))` (i.e. 0xbc197c81) if it accepts the transfer(s). This function MUST revert if it rejects the transfer(s). Return of any other value than the prescribed keccak256 generated value MUST result in the transaction being reverted by the caller.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _operator | address | The address which initiated the batch transfer (i.e. msg.sender)
| _from | address | The address which previously owned the token
| _ids | uint256[] | An array containing ids of each token being transferred (order and length must match _values array)
| _values | uint256[] | An array containing amounts of each token being transferred (order and length must match _ids array)
| _data | bytes | Additional data with no specified format

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes4 | `bytes4(keccak256(&quot;onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)&quot;))`

### onERC1155Received

```solidity
function onERC1155Received(address _operator, address _from, uint256 _id, uint256 _value, bytes _data) external nonpayable returns (bytes4)
```

Handle the receipt of a single ERC1155 token type.

*An ERC1155-compliant smart contract MUST call this function on the token recipient contract, at the end of a `safeTransferFrom` after the balance has been updated.         This function MUST return `bytes4(keccak256(&quot;onERC1155Received(address,address,uint256,uint256,bytes)&quot;))` (i.e. 0xf23a6e61) if it accepts the transfer. This function MUST revert if it rejects the transfer. Return of any other value than the prescribed keccak256 generated value MUST result in the transaction being reverted by the caller.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _operator | address | The address which initiated the transfer (i.e. msg.sender)
| _from | address | The address which previously owned the token
| _id | uint256 | The ID of the token being transferred
| _value | uint256 | The amount of tokens being transferred
| _data | bytes | Additional data with no specified format

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes4 | `bytes4(keccak256(&quot;onERC1155Received(address,address,uint256,uint256,bytes)&quot;))`




