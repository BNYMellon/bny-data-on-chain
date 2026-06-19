// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

import { IBNYDataConsumerV2 } from "./IBNYDataConsumerV2.sol";

contract BNYDataConsumerExample {
    /* Update the data contract proxy address below */
    IBNYDataConsumerV2 private constant _oracle = IBNYDataConsumerV2(0xCC75D07cBC86f306A033af29508a1b98E2178264);

    /**
     * @dev Fetches BUIDL NAV data from the BNY oracle for the Ethereum share class.
     * @return An array of uint256 containing the NAV data for the Ethereum share class.
     */
    function getBuidlNav() public view returns (uint256[] memory) {
        uint256[] memory _data = new uint256[](6);
        uint8 shareClass = 2; // Ethereum share class

        _data[0] = _oracle.getUint256(shareClass, 1); // NAV for Valuation Date *
        _data[1] = _oracle.getUint256(shareClass, 2); // Current Valuation Date's Shares Outstanding Value
        _data[2] = _oracle.getUint256(shareClass, 3); // Timestamp when the transaction was last updated
        _data[3] = _oracle.getUint256(shareClass, 4); // Business Date of the Valuation for the NAV
        _data[4] = _oracle.getUint256(shareClass, 5); // Timestamp after which the current data becomes outdated
        _data[5] = _oracle.getUint256(shareClass, 6); // Daily distribution rate of the fund by shareclass *

        return _data;
    }
}
