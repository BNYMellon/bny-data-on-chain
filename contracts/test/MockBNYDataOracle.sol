// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import { IBNYDataConsumerV2 } from "../IBNYDataConsumerV2.sol";

/**
 * @title MockBNYDataOracle
 * @dev A mock implementation of the IBNYDataConsumerV2 interface for testing purposes.
 *      Allows setting data values, simulating suspension, and triggering custom errors.
 */
contract MockBNYDataOracle is IBNYDataConsumerV2 {
    bool private _suspended;

    // (shareClass, key) => DataType
    mapping(uint8 => mapping(uint8 => DataType)) private _types;
    // (shareClass, key) => raw bytes32 value
    mapping(uint8 => mapping(uint8 => bytes32)) private _values;

    // --- Admin helpers for tests ---

    function setUint256(uint8 shareClass, uint8 key, uint256 value) external {
        _types[shareClass][key] = DataType.UINT256;
        _values[shareClass][key] = bytes32(value);
        emit DataSet(shareClass, key, DataType.UINT256);
        emit DataUpdated(shareClass, key, bytes32(value));
    }

    function setBytes32(uint8 shareClass, uint8 key, bytes32 value) external {
        _types[shareClass][key] = DataType.BYTES32;
        _values[shareClass][key] = value;
        emit DataSet(shareClass, key, DataType.BYTES32);
        emit DataUpdated(shareClass, key, value);
    }

    function setString32(uint8 shareClass, uint8 key, string memory value) external {
        _types[shareClass][key] = DataType.STRING32;
        _values[shareClass][key] = bytes32(bytes(value));
        emit DataSet(shareClass, key, DataType.STRING32);
    }

    function setInt256(uint8 shareClass, uint8 key, int256 value) external {
        _types[shareClass][key] = DataType.INT256;
        _values[shareClass][key] = bytes32(uint256(value));
        emit DataSet(shareClass, key, DataType.INT256);
    }

    function clearData(uint8 shareClass, uint8 key) external {
        _types[shareClass][key] = DataType.NOT_SET;
        delete _values[shareClass][key];
        emit DataCleared(shareClass, key);
    }

    function suspend() external {
        _suspended = true;
        emit Suspended(msg.sender);
    }

    function resume() external {
        _suspended = false;
        emit Resumed(msg.sender);
    }

    // --- IBNYDataConsumerV2 implementation ---

    function getType(uint8 shareClass, uint8 key) external view override returns (DataType dataType) {
        return _types[shareClass][key];
    }

    function getBytes32(uint8 shareClass, uint8 key) external view override returns (bytes32 value) {
        _checkSuspended();
        _checkDataSet(shareClass, key);
        if (_types[shareClass][key] != DataType.BYTES32) {
            revert InvalidDataType(shareClass, key);
        }
        return _values[shareClass][key];
    }

    function getUint256(uint8 shareClass, uint8 key) external view override returns (uint256 value) {
        _checkSuspended();
        _checkDataSet(shareClass, key);
        if (_types[shareClass][key] != DataType.UINT256) {
            revert InvalidDataType(shareClass, key);
        }
        return uint256(_values[shareClass][key]);
    }

    function getInt256(uint8 shareClass, uint8 key) external view override returns (int256 value) {
        _checkSuspended();
        _checkDataSet(shareClass, key);
        if (_types[shareClass][key] != DataType.INT256) {
            revert InvalidDataType(shareClass, key);
        }
        return int256(uint256(_values[shareClass][key]));
    }

    function getString32(uint8 shareClass, uint8 key) external view override returns (string memory value) {
        _checkSuspended();
        _checkDataSet(shareClass, key);
        if (_types[shareClass][key] != DataType.STRING32) {
            revert InvalidDataType(shareClass, key);
        }
        return string(abi.encodePacked(_values[shareClass][key]));
    }

    // --- Internal helpers ---

    function _checkSuspended() private view {
        if (_suspended) {
            revert LatestDataDelayed();
        }
    }

    function _checkDataSet(uint8 shareClass, uint8 key) private view {
        if (_types[shareClass][key] == DataType.NOT_SET) {
            revert DataNotSet(shareClass, key);
        }
    }
}
