// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

interface IBNYDataConsumerV2 {
    enum DataType {
        NOT_SET,
        BYTES32,
        UINT256,
        INT256,
        STRING32
    }

    event DataSet(uint8 indexed shareClass, uint8 indexed key, DataType dataType);
    event DataCleared(uint8 indexed shareClass, uint8 indexed key);
    event DataTypeChanged(uint8 indexed shareClass, uint8 indexed key, DataType oldType, DataType newType);
    event DataUpdated(uint8 indexed shareClass, uint8 indexed key, bytes32 value);
    event Suspended(address account);
    event Resumed(address account);

    error LatestDataDelayed();
    error DataNotSet(uint8 shareClass, uint8 key);
    error InvalidDataType(uint8 shareClass, uint8 key);

    function getType(uint8 shareClass, uint8 key) external view returns (DataType dataType);
    function getBytes32(uint8 shareClass, uint8 key) external view returns (bytes32 value);
    function getUint256(uint8 shareClass, uint8 key) external view returns (uint256 value);
    function getInt256(uint8 shareClass, uint8 key) external view returns (int256 value);
    function getString32(uint8 shareClass, uint8 key) external view returns (string memory value);
}
