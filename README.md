<p><img src="https://www.bny.com/content/dam/bnymellon/images/about-us/bny-logo---2024-brand-update.png" alt="BNY Logo" width="300"></p>

**BNY Digital Assets Business**

**BNY Data On-Chain Product**

**User Guide v1 – updated 1<sup>st</sup> April 2025**

© The Bank of New York Mellon.  2025. All Rights Reserved.  

 

> **DISCLAIMER:** 
>
> Unless required by applicable law or agreed to in writing, the BNY Data On-Chain product and this User Guide are distributed at the instruction of the Fund Manager and on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  
>
> The data on the BNY On-Chain product is for general informational purposes only and does not constitute financial or investment advice.  
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of BNY Data On-Chain product.  
>
> For questions or clarifications, please contact digital.asset.inquiries@bny.com 

## Table of Contents

1. [BNY Data On-Chain Product Overview](#1-bny-data-on-chain-product-overview)
-  1.1. [BNY Data Contract](#11-bny-data-contract)
-  1.2. [Proxy Pattern](#12-proxy-pattern)
-  1.3. [Consumer Persona](#13-consumer-persona)
-  1.4. [Additional information](#14-additional-information)

2. [Getting Started](#2-getting-started)
-  2.1. [Consumer Interface - IBNYDataConsumer](#21-consumer-interface---ibnydataconsumer)
-  2.2. [Events](#22-events)
-  2.3. [Functions](#23-functions)
-  2.4. [Exception Cases](#24-exception-cases)

3. [Sourcing Data for the Blackrock USD Digital Liquidity (BUIDL) Fund](#3-sourcing-data-for-the-blackrock-usd-digital-liquidity-buidl-fund)
-  3.1. [Overview](#31-overview)
-  3.2. [Data Contracts](#32-data-contracts)
-  3.3. [Supported Share Classes](#33-supported-share-classes)
-  3.4. [Supported Data Fields](#34-supported-data-fields)
-  3.5. [Examples](#35-examples)

4. [Code Examples](#4-code-examples)
-  4.1. [On-Chain Example Consumer](#41-on-chain-example-consumer)
-  4.2. [Off-Chain Example Consumer](#42-off-chain-example-consumer)

# 1. BNY Data On-Chain Product Overview 

### 1.1 BNY Data Contract

The BNY Data On-Chain product provides on-chain consumers with the ability to leverage data that has been broadcasted into the smart contract by BNY on behalf of BNY clients.

### 1.2 Proxy Pattern

The BNY Data On-chain product uses smart contracts which consumers can query using public blockchain networks. The smart contract utilizes the “Proxy Upgrade Pattern” to separate the stored data from the logic of updating and querying the data. It allows upgrading of the data contract logic without losing the data itself. Consumers will interact with the proxy contract and not with the implementation contracts.

### 1.3 Consumer Persona

A consumer of the product can be an on-chain contract or off-chain application. There are different ways that you can pull the data. It is recommended to use the consumer interface [\[Section 2\]](#2-getting-started) to interact with the data contract. Please follow the guidelines on how to source data [\[Section 3\]](#3-sourcing-data-for-the-blackrock-usd-digital-liquidity-buidl-fund) using code examples [\[Section 4\]](#4-code-examples).

### 1.4 Additional information
> The BNY Data On-Chain product source code includes code subject to MIT License (MIT).
>
> https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/LICENSE 
>
> The MIT License (MIT) 
>
> Copyright (c) 2016-2024 Zeppelin Group Ltd 
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:  
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. 
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 

# 2. Getting Started

### 2.1 Consumer Interface - IBNYDataConsumer 

The consumer interface contains the [events \[2.2\]](#22-events), [functions \[2.3\]](#23-functions) and [exceptions \[2.4\]](#24-exception-cases) exposed by the data contract. Consumers can leverage the interface to encode and decode such interactions to achieve better readability. Please also see the subsequent sessions on further description, expected data and example topic return for each interaction. 

```javascript
// SPDX-License-Identifier: UNLICENSED 
pragma solidity 0.8.18; 

interface IBNYDataConsumer { 
    event DataUpdated(uint8 indexed shareClass, uint8 indexed key, uint256 value); 
    event Suspended(address account); 
    event Resumed(address account); 
    error LatestDataDelayed(); 

    function getUint256(uint8 shareClass, uint8 key) external view returns (uint256 value); 
} 
```

### 2.2 Events 
Consumers can subscribe to events to get notified when events are emitted. Event notifications are emitted when the state of the oracle contract changes. Events are emitted independently from each other.

```javascript 
1. event DataUpdated(uint8 indexed shareClass, uint8 indexed key, uint256 value)
```

- **Description:** Emitted when a data field is updated. This is usually on weekdays excluding non-bank days.
- **Data:** The share class and key pair updated with value 
- **Topic:** `0x0f1bbd6e6dd42dc3cb226a5d2ab556b278f645a2923d672425ca1451e10a8d3e`
- [Example Transaction](https://sepolia.etherscan.io/tx/0xec025c1921bf06b1457c3f4a2d4c66a55ef7940bb8ffc7fd89c6d477876bc24b#eventlog)

```javascript 
2. event Suspended(address account)
```

- **Description:** Emitted when the data contract is suspended 
- **Data:** The account that has suspended the data contract 
- **Topic:** `0x6f123d3d54c84a7960a573b31c221dcd86e13fd849c5adb0c6ca851468cc1ae4` 
- [Example Transaction](https://sepolia.etherscan.io/tx/0x62e634d78d56619f7ba6beea3d250784b693760f7c08e0e627da6e6d8f954dcd#eventlog)  

```javascript 
3. event Resumed(address account)
```

- **Description:**  Emitted when the data contract is mark as no longer suspended
- **Data:** The account that has resumed the data contract 
- **Topic:** `0x5d287a3a02ade76478d8449abebe9dc45b38421247132b68127dd3cd6c05f3cf`
- [Example Transaction](https://sepolia.etherscan.io/tx/0x7b5b7bfa6d37671b6080d3ec3664a092b62c3bc6d4b83c9e9263942a9c4a7b81#eventlog)

##### Example Scenario and Events: 
* **Day 1**: Data is sent for two share classes, each with eight data fields into oracle contract.  
Events emitted: 2 * 8 = 16 `DataUpdated` events. 

* **Day 2**: Oracle contract is suspended, no data fields was updated.   
Events emitted: 1 `Suspended` event. 

* **Day 3**: Oracle contract resumes, data is sent for two share classes, each with eight data fields into oracle contract.   
Events emitted: 2 * 8 = 16 `DataUpdated` events and 1 `Resumed` event (17 total). 

* **Day 4**: Holiday. No updates performed.   
Events emitted: None. 

### 2.3 Functions 

```javascript 
1. function getUint256(uint8 shareClass, uint8 key) external view returns (uint256 value)
```

- **Description:** To retrieve the data associated with a (shareClass key, dataField key) tuple, the `getUint256` function must pass the unique integer key associated with each share class [\[Section 3.3\]](#33-supported-share-classes) and data field [\[Section 3.4\]](#34-supported-data-fields). 

### 2.4 Exception Cases 

```javascript 
1. error LatestDataDelayed()
```

- **Description:** Thrown if `getUint256` is called and when the data contract is suspended due to exception scenarios [\[Section 3.1\]](#31-overview).
- **Data:** `0x699cff30`

# 3. Sourcing Data for the Blackrock USD Digital Liquidity (BUIDL) Fund

### 3.1 Overview  

| Fund Name |  Investment Manager | “Blockchains” the data will be broadcasted onto |
| ----------- | ----------- | ----------- |
| Blackrock USD Digital Liquidity (BUIDL) Fund  | BlackRock Financial Management, Inc | Ethereum |

The BNY Data On-chain product aims to publish fund accounting data for the BUIDL fund. The Data Elements will be posted each day a Net Asset Value (NAV) is calculated for the Fund Accounting (FA) Customer by BNY. This is a daily feed reporting some fund accounting data fields as instructed by the Investment Manager for the BUIDL fund.  

The data feed is updated once each business day as soon as the new NAV data is available. No data will be published on weekends or Federal Reserve holiday schedule (similar to what is used for the Fund Accounting service on the BUIDL fund) as there is no Fund Accounting on non-bank days. On-chain consumers are advised to reference the Effective Until Date (dataField Key = 5) to identify the validity of the NAV published.   

Any exception cases (e.g., NAV delayed or an Audit re-open), will result in the feed being marked as suspended and the smart contract emitting a `Suspended()` event. Any calls to the smart contract will throw a `LatestDataDelayed()` error.   

### 3.2 Data Contracts
To retrieve data from the data contract, use `getUint256` function [\[Section 2.3\]](#23-functions). This function returns the data value as an unsigned integer `uint256`.

If decimals are applicable to the queried value, consumers should divide the value by the decimals associated with the data point, to get the actual numeric value. Decimals apply to 3 different fields: NAV, with a dataField key of 2; Shares outstanding, with a dataField key of 3; and Daily Distribution Rate, with a dataField key of 3.

Should there be an instructed removal of any of the associated data below, the integer keys will be unmapped, and all associated values will be zeroed out.

|Network | Data Contract Address |
| ----------- | ----------- |
| Ethereum Mainnet  | [0x7B0eC8D1D1254358A77f107118e96885EdDCEb16](https://etherscan.io/address/0x7B0eC8D1D1254358A77f107118e96885EdDCEb16) |
| Sepolia Testnet  | [0xC2617d6b0510f7f029032bA7694880E569A84073](https://sepolia.etherscan.io/address/0xC2617d6b0510f7f029032bA7694880E569A84073) |

### 3.3 Supported Share Classes
| shareClass Key | Associated Blockchain |
| ----------- | ----------- |
| 1 | `Aggregated Data` – This “share class” contains aggregate statistics for the entire fund |
| 2 | `Ethereum - A` |
| 3 | `Aptos` |
| 4 | `Arbitrum` |
| 5 | `Avalanche` |
| 6 | `Optimism’s OP` |
| 7 | `Polygon` |
| 8 | `Ethereum - I` |  |

\* Any new share classes launched will be included in the next technical release, alongside an update to the User guide  

### 3.4 Supported Data Fields
| dataField Key | Data Field Description | Decimal Precision* |
| ----------- | ----------- | ----------- |
| 1 | NAV for Valuation Date. <br/><br/> - _Not applicable for the “aggregated data” share class key = 1, will return 0_ | 2 |
| 2 | Current Valuation Date's Shares Outstanding Value | 6 |
| 3 | The timestamp when the transaction was last updated in Unix Epoch time format. _Unix Epoch Time format is expressed as the number of non-leap seconds which have passed since Jan 1 1970 00:00:00 UTC_ | N/A |
| 4 | The Business Date of the Valuation for the NAV, converted to Unix Epoch format.  The time component of 00:00:00 EST is added to the business date and converted to UTC for storage in Unix Epoch format  | N/A |
| 5 | The timestamp after which the current data becomes outdated. The time reflects the business date after the Date of Valuation, at 14:30:00 EST. The data is converted to UTC for storage in Unix Epoch format | N/A |
| 6 | Daily distribution rate of the fund by shareclass. <br/><br/> - _Not applicable for the “aggregated data” share class key = 1, will return 0_ | 9 |

\* Divide the result by 10^decimal precision for the given field to arrive on the reported data 

\*\* Any new data fields added will be included in the next technical release, alongside an update to the User guide  

### 3.5 Examples
1. `getUint256(3, 2)`: Returns the **total number of shares outstanding** for the BUIDL **Aptos** share classes.
2. `getUint256(7, 1)`: Returns the **reporting NAV** for the BUIDL **Polygon** share classes.
3. `getUint256(6, 5)`: Returns the date and time until which the current data is valid for the BUIDL Optimism share class. 

# 4. Code Examples
The following on and off chain consumer examples utilize a BNY data contract deployed on Sepolia test network. The data contract address is [0xC2617d6b0510f7f029032bA7694880E569A84073](https://sepolia.etherscan.io/address/0xC2617d6b0510f7f029032bA7694880E569A84073). 
> **Note**: The data contract above is used for testing purposes only and is **not** actively updated.

### 4.1 On-Chain Example Consumer
The following example demonstrates how to consume data from the data contract using a consumer smart contract deployed on-chain. The `IBNYDataConsumer` interface [\[Section 2.1\]](#21-consumer-interface---ibnydataconsumer) is used to interact with the data contract. The sample consumer `getBuidlNav()` function calls the `getUint256()` function of the data contract to obtain the latest NAV data available for the Ethereum blockchain. However, it can be modified to fetch any supported data field for any share class.

```javascript
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

import { IBNYDataConsumer } from "./IBNYDataConsumer.sol";

contract BNYDataConsumerExample {
    /* Update the data contract proxy address below */
    IBNYDataConsumer private constant _oracle = IBNYDataConsumer(0xC2617d6b0510f7f029032bA7694880E569A84073);

    /**
     * @dev Fetches BUIDL NAV data from the BNY oracle for the Ethereum share class.
     * @return An array of uint256 containing the NAV data for the Ethereum share class.
     */
    function getBuidlNav() public view returns (uint256[] memory) {
        uint256[] memory _data = new uint256[](6);
        uint8 shareClass = 2; // Ethereum share class

        _data[0] = _oracle.getUint256(shareClass, 1); // NAV for Valuation Date
        _data[1] = _oracle.getUint256(shareClass, 2); // Current Valuation Date's Shares Outstanding Value
        _data[2] = _oracle.getUint256(shareClass, 3); // Timestamp when the transaction was last updated
        _data[3] = _oracle.getUint256(shareClass, 4); // Business Date of the Valuation for the NAV
        _data[4] = _oracle.getUint256(shareClass, 5); // Timestamp after which the current data becomes outdated
        _data[5] = _oracle.getUint256(shareClass, 6); // Daily distribution rate of the fund by shareclass

        return _data;
    }
}
```

To use the sample contract on Sepolia, follow the steps below: 
1. Add the `IBNYDataConsumer.sol` [\[Section 2.1\]](#21-consumer-interface---ibnydataconsumer) interface and `BNYDataConsumerExample.sol` example code above in the `contracts/` folder.
2. Compile the code
3. Fund your deployer wallet with Sepolia ETH.
4. Deploy the contract to Sepolia using the prefunded account.
5. Use the address of the newly deployed contract to invoke the `getEthereumData()` function.
6. All latest values of the selected share class will be returned, or if the contract is suspended a `LatestDataDelayed()` error will be thrown. 

##### Example Result
``` javascript
getBuidlNav(): 100, 2878306530330000, 1733355683, 1733288400, 1733427000, 106064
```

### 4.2 Off-Chain Example Consumer
##### Prerequisites
The following example demonstrates how to consume multiple data elements from the data contract using an off-chain consumer script. 
> **Note**: The example script provided below has been implemented using Java Script, Node.js and Hardhat development framework. It is not the only approach available and other programming languages and frameworks can be utilized as well.  

##### Setup (Illustrative Example)
1. Initialize [Hardhat Project](https://hardhat.org/hardhat-runner/docs/getting-started) 
2. Add `IBNYDataConsumer` to `/contracts/`.
3. Add the required network configuration to `Hardhat.config.ts`. Include the _chain ID_ and the _JSON-RPC url_ In our test case, we add Sepolia
    ```javascript
    config.networks.sepolia = {
        chainId: 11155111,
        url: "/* JSON-RPC url like Node as a service or a private RPC node */",
        accounts: [
            /* specific accounts to be used if relevant */
        ],
    };
    ```
    - Please take the appropriate precautions when storing and loading sensitive data like private keys or url tokens. 
4. Add the `offchain-consumer.ts` script to `/scripts/`
    ```javascript
    import { ethers } from "hardhat";
    import { IBNYDataConsumer } from "../typechain-types";

    async function main() {
        "/* Update the data contract proxy address below */"
        const address = "0xC2617d6b0510f7f029032bA7694880E569A84073";
        const oracle: IBNYDataConsumer = await ethers.getContractAt("IBNYDataConsumer", address);

        const inputs = [
            { shareClass: 2, key: 1 },
            { shareClass: 2, key: 2 },
            { shareClass: 2, key: 3 },
            { shareClass: 2, key: 4 },
            { shareClass: 2, key: 5 },
            { shareClass: 2, key: 6 },
        ];

        for (const input of inputs) {
            const { shareClass, key } = input;
            console.log(
                `oracle.getUint256(${shareClass}, ${key}): ${await oracle.getUint256(shareClass, key)}`
            );
        }
    }

    main();
    ```

##### Execution
To execute the provided script run in the shell: 
1. `npx hardhat compile` - to compile the contracts
2. `npx hardhat run .\scripts\offchain-consumer.ts --network sepolia` - to execute the off-chain consumer script.

##### Example Result
``` javascript
oracle.getUint256(2, 1): 100 
oracle.getUint256(2, 2): 2878306530330000 
oracle.getUint256(2, 3): 1733355683 
oracle.getUint256(2, 4): 1733288400 
oracle.getUint256(2, 5): 1733427000 
oracle.getUint256(2, 6): 106064 
```
