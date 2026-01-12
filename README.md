<p><img src="https://www.bny.com/content/dam/bnymellon/images/about-us/bny-logo---2024-brand-update.png" alt="BNY Logo" width="300"></p>

**BNY Digital Assets Business**

**BNY Data On-Chain Product**

**User Guide v2 – updated 8<sup>th</sup> January 2026**

© The Bank of New York Mellon.  2026. All Rights Reserved.  

 

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
-  2.1. [Consumer Interface - IBNYDataConsumerV2](#21-consumer-interface---ibnydataconsumerv2)
-  2.2. [Types](#22-types)
-  2.3. [Events](#23-events)
-  2.4. [Functions](#24-functions)
-  2.5. [Exception Cases](#25-exception-cases)

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

### 2.1 Consumer Interface - IBNYDataConsumerV2

The consumer interface contains the [types \[2.2\]](#22-types), [events \[2.3\]](#23-events), [functions \[2.4\]](#24-functions) and [errors \[2.5\]](#25-exception-cases) exposed by the data contract. Consumers can leverage the interface to encode and decode such interactions to achieve better readability. Please also see the subsequent sessions on further description, expected data and example topic return for each interaction. 

```javascript
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
```

### 2.2 Types 
```javascript 
1. enum DataType
```

- **Description:** Indicating the type of data stored in a specific (share class, key) data field.
- **Values:** 
    - `NOT_SET` [0] - the default type, implying data field is not set yet or was cleared.
    - `BYTES32` [1] - raw bytes data of 32 bytes max length.
    - `UINT256` [2] - positive numbers only.
    - `INT256` [3] - positive and negative numbers.
    - `STRING32` [4] - string data of 32 bytes (up to 32 characters) max length.
- Note that for the data available in the “BUIDL Data Feed” product, only `NOT_SET` and `UINT256` is currently used  

### 2.3 Events 
Consumers can subscribe to events to get notified when events are emitted. Event notifications are emitted when the state of the oracle contract changes. Events are emitted independently from each other.

##### Data Update Events relates to event notifications when there is a change of data fields

```javascript 
1. event DataSet(uint8 indexed shareClass, uint8 indexed key, DataType dataType)
```

- **Description:** Emitted when a data field is set to store data from a specific type 
- **Data:** The share class, key, and the desired type of data 
- **Topic:** `0x91a97b97a6051b305ad51f93c1ccc4f8f5781b27ddcc2f041aba1017a5c23269`
- [Example Transaction](https://sepolia.etherscan.io/tx/0x003991a8ef73717516ed8fa5aba93a997f48522aedacf20eb5ee0c296453c577#eventlog)

```javascript 
2. event DataCleared(uint8 indexed shareClass, uint8 indexed key)
```

- **Description:** Emitted when a data field is cleared 
- **Data:** The share class and key 
- **Topic:** `0x1e1cd16fc14f8f4dbc8bbaabc13f18749563d595e318f5ebc658bbc8f6c71d20`
- [Example Transaction](https://sepolia.etherscan.io/tx/0x67866544bfb7232b640d8cbf021a01bde03fee9167136ea9bb927e5693994f3d#eventlog)

```javascript 
3. event DataTypeChanged(uint8 indexed shareClass, uint8 indexed key, DataType oldType, DataType newType)
```

- **Description:** Emitted when a data field type is changed to store a different type of data. Not currently used in “BUIDL Data Feed” 
- **Data:** The share class, key, the old and new types of data 
- **Topic:** `0x6d26eb1c19877fcc7fee0be138fd600970ff7d491ee150f195371122c700a2da`
- [Example Transaction](https://sepolia.etherscan.io/tx/0x15878cca01101d78f060e77dbc78f9c7cabb421381f184a765dab33f4f01e12b#eventlog)

```javascript 
4. event DataUpdated(uint8 indexed shareClass, uint8 indexed key, bytes32 value) 
```

- **Description:** Emitted when a data field is updated. This is usually on weekdays excluding non-bank days.
- **Data:** The share class and key pair updated with value 
- **Topic:** `0xfe8cb7784c01ae1334f5267aa05075d6f494b10cea556e88cde87f84aff20503`
- [Example Transaction](https://sepolia.etherscan.io/tx/0x003991a8ef73717516ed8fa5aba93a997f48522aedacf20eb5ee0c296453c577#eventlog)

##### Suspension Mechanism Events relates to event notifications when an automated action taken due to an exception cases (e.g., NAV delayed or an Audit re-open) 

```javascript 
5. event Suspended(address account)
```

- **Description:** Emitted when the data contract is suspended by exception cases. If auto-suspend occurs due to NAV data delay, no event is emitted
- **Data:** The account that has suspended the data contract 
- **Topic:** `0x6f123d3d54c84a7960a573b31c221dcd86e13fd849c5adb0c6ca851468cc1ae4` 
- [Example Transaction](https://sepolia.etherscan.io/tx/0x67866544bfb7232b640d8cbf021a01bde03fee9167136ea9bb927e5693994f3d#eventlog)  

```javascript 
6. event Resumed(address account)
```

- **Description:**  Emitted when the data contract is mark as no longer suspended
- **Data:** The account that has resumed the data contract 
- **Topic:** `0x5d287a3a02ade76478d8449abebe9dc45b38421247132b68127dd3cd6c05f3cf`
- [Example Transaction](https://sepolia.etherscan.io/tx/0x003991a8ef73717516ed8fa5aba93a997f48522aedacf20eb5ee0c296453c577#eventlog)

##### Example Scenario and Events: 
* **Day 1**: Data is sent for two share classes, each with eight data fields into oracle contract.  
Events emitted: 2 * 8 = 16 `DataUpdated` events. 

* **Day 2**: Oracle contract is suspended, no data fields was updated.   
Events emitted: 1 `Suspended` event. 

* **Day 3**: Oracle contract resumes, data is sent for two share classes, each with eight data fields into oracle contract.   
Events emitted: 2 * 8 = 16 `DataUpdated` events and 1 `Resumed` event (17 total). 

* **Day 4**: Holiday. No updates performed.   
Events emitted: None. 

### 2.4 Functions 

**To identify the available data type,**
```javascript 
1. function getType(uint8 shareClass, uint8 key) external view returns (DataType dataType)
```
- **Description:** This function returns the type of data associated with a (shareClass key, dataField key) tuple.

**To source the data,** the following functions get a share class and a key, and return the value of the given data field.
- If the data field has not been set yet, a `DataNotSet()` error will be thrown.  
- If the data field does not match the function used to retrieve the data, a `InvalidDataType()` error will be thrown. For example, querying a `uint256` field using `getString32()` function. 

```javascript 
2. function getUint256(uint8 shareClass, uint8 key) external view returns (uint256 value)
```
- **Description:** To retrieve the data associated with a (shareClass key, dataField key) tuple, the `getUint256` function must pass the unique integer key associated with each share class [\[Section 3.3\]](#33-supported-share-classes) and data field [\[Section 3.4\]](#34-supported-data-fields). 

_**Note**: Other functions available for sourcing data but not currently used in “BUIDL Data Feed” includes (1) getBytes32, (2) getInt256 and (3) getString32._

### 2.5 Exception Cases 

##### Data Update Errors 

```javascript 
1. error LatestDataDelayed()
```
- **Description:** Thrown if `getUint256` is called and when the data contract is suspended due to exception scenarios [\[Section 3.1\]](#31-overview).
- **Data:** `0x699cff30`

##### Suspension Mechanism Errors 

```javascript 
2. error DataNotSet(uint8 shareClass, uint8 key) 
```
- **Description:** Thrown when calling a getter function for a data field that has not been set [\[Section 3.1\]](#31-overview).
- **Data:** `0x0c002637`

```javascript 
3. error InvalidDataType(uint8 shareClass, uint8 key) 
```
- **Description:** Thrown when calling a getter function for a data field that with a different type than the getter function. For example, calling `getString32(x, y)` when (x, y) is a `uint256` field  [\[Section 3.1\]](#31-overview).
- **Data:** `0x95301814`

# 3. Sourcing Data for the Blackrock USD Digital Liquidity (BUIDL) Fund

### 3.1 Overview  

| Fund Name |  Investment Manager | “Blockchains” the data will be broadcasted onto |
| ----------- | ----------- | ----------- |
| Blackrock USD Digital Liquidity (BUIDL) Fund  | BlackRock Financial Management, Inc | Ethereum |

The BNY Data On-chain product aims to publish fund accounting data for the BUIDL fund. The Data Elements will be posted each day a Net Asset Value (NAV) is calculated for the Fund Accounting (FA) Customer by BNY. This is a daily feed reporting some fund accounting data fields as instructed by the Investment Manager for the BUIDL fund.  

The data feed is updated once each business day as soon as the new NAV data is available. No data will be published on weekends or Federal Reserve holiday schedule (similar to what is used for the Fund Accounting service on the BUIDL fund) as there is no Fund Accounting on non-bank days. On-chain consumers are advised to reference the Effective Until Date (dataField Key = 5) to identify the validity of the NAV published.   

Any exception cases (e.g., NAV delayed or an Audit re-open), will result in the feed being marked as suspended and the smart contract emitting a `Suspended()` event. Any calls to the smart contract will throw a `LatestDataDelayed()` error. Querying a share class and a key that are not yet set, will result in a `DataNotSet()` error and the transaction will fail. 

### 3.2 Data Contracts
To retrieve data from the data contract, use the appropriate function [\[Section 2.4\]](#24-functions). The appropriate function returns the data value that is supported [\[Section 2.2\]](#22-types).  

If decimals are applicable to the queried value, consumers should divide the value by the decimals associated with the data point, to get the actual numeric value. Decimals apply to 3 different fields: NAV, with a dataField key of 2; Shares outstanding, with a dataField key of 3; and Daily Distribution Rate, with a dataField key of 3.

Should there be an instructed removal of any of the associated data below, the integer keys will be unmapped, and the type will be changed to `NOT_SET` and throw error `DataNotSet` [\[Section 2.5\]](#25-functions) when queried.

|Network | Data Contract Address |
| ----------- | ----------- |
| Ethereum Mainnet  | [0x7B0eC8D1D1254358A77f107118e96885EdDCEb16](https://etherscan.io/address/0x7B0eC8D1D1254358A77f107118e96885EdDCEb16) |
| Sepolia Testnet  | [0xCC75D07cBC86f306A033af29508a1b98E2178264](https://sepolia.etherscan.io/address/0xCC75D07cBC86f306A033af29508a1b98E2178264) |

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
| 9 | `Solana` |  |
| 10 | `BNB Chain` |  |

\* Any new share classes launched will be included in the next technical release, alongside an update to the User guide  

### 3.4 Supported Data Fields
| Data Field Key | Data Field Type | Data Field Description | Decimal Precision* |
| ----------- | ----------- | ----------- | ----------- |
| 1 | `uint256` | NAV for Valuation Date. <br/><br/> - _Not applicable for the “aggregated data” share class key = 1, will throw `DataNotSet` error_ | 2 |
| 2 | `uint256` | Current Valuation Date's Shares Outstanding Value | 6 |
| 3 | `uint256` | The timestamp when the transaction was last updated in Unix Epoch time format. _Unix Epoch Time format is expressed as the number of non-leap seconds which have passed since Jan 1 1970 00:00:00 UTC_ | N/A |
| 4 | `uint256` | The Business Date of the Valuation for the NAV, converted to Unix Epoch format.  The time component of 00:00:00 EST is added to the business date and converted to UTC for storage in Unix Epoch format  | N/A |
| 5 | `uint256` | The timestamp after which the current data becomes outdated. The time reflects the business date after the Date of Valuation, at 14:30:00 EST. The data is converted to UTC for storage in Unix Epoch format | N/A |
| 6 | `uint256` | Daily distribution rate of the fund by shareclass. <br/><br/> - _Not applicable for the “aggregated data” share class key = 1, will throw `DataNotSet` error_ | 9 |

\* Divide the result by 10^decimal precision for the given field to arrive on the reported data 

\*\* Any new data fields added will be included in the next technical release, alongside an update to the User guide  

### 3.5 Examples
1. `getUint256(3, 2)`: Returns the **total number of shares outstanding** for the BUIDL **Aptos** share classes.
2. `getUint256(7, 1)`: Returns the **reporting NAV** for the BUIDL **Polygon** share classes.
3. `getUint256(6, 5)`: Returns the date and time until which the current data is valid for the BUIDL Optimism share class. 

# 4. Code Examples
The following on and off chain consumer examples utilize a BNY data contract deployed on Sepolia test network. This example reflects only the data available currently in the “BUIDL Data Feed“ smart contract. 

The data contract address is [0xCC75D07cBC86f306A033af29508a1b98E2178264](https://sepolia.etherscan.io/address/0xCC75D07cBC86f306A033af29508a1b98E2178264). 
> **Note**: The data contract above is used for testing purposes only and is **not** actively updated.

### 4.1 On-Chain Example Consumer
The following example demonstrates how to consume data from the data contract using a consumer smart contract deployed on-chain. The `IBNYDataConsumerV2` interface [\[Section 2.1\]](#21-consumer-interface---ibnydataconsumer) is used to interact with the data contract. The sample consumer `getBuidlNav()` function calls the `getUint256()` function of the data contract to obtain the latest NAV data available for the Ethereum blockchain. However, it can be modified to fetch any supported data field for any share class.

```javascript
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
```
\* e.g., will revert transaction for shareClass 1 and dataField 1 or 6 

To use the sample contract on Sepolia, follow the steps below: 
1. Add the `IBNYDataConsumerV2.sol` [\[Section 2.1\]](#21-consumer-interface---ibnydataconsumer) interface and `BNYDataConsumerExampleV2.sol` example code above in the `contracts/` folder.
2. Compile the code
3. Fund your deployer wallet with Sepolia ETH.
4. Deploy the contract to Sepolia using the prefunded account.
5. Use the address of the newly deployed contract to invoke the `getBuidlNav()` function.
6. All latest values of the selected share class will be returned, or if the contract is suspended a `LatestDataDelayed()` error will be thrown. 

##### Example Result
``` javascript
getBuidlNav(): 100, 2878306530330000, 1733355683, 1733288400, 1733427000, 106064
```

### 4.2 Off-Chain Example Consumer
##### Prerequisites
The following example demonstrates how to consume multiple data elements from the data contract using an off-chain consumer script. 
> **Note**: The example script provided below has been implemented using Java Script, Node.js and Hardhat development framework. It is not the only approach available and other programming languages and frameworks can be utilized as well. There could be variations to the output depending on the application version adopted by the consumer. Please note that depending on the hardhat/nodejs version used, slight tweaks will have to be made by the consumer.

##### Setup (Illustrative Example)
1. Initialize [Hardhat Project](https://hardhat.org/hardhat-runner/docs/getting-started) 
2. Add `IBNYDataConsumerV2` to `/contracts/`.
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
import { ethers, network } from "hardhat";

type KeyDetails = {
    [key: number]: {
        name: string;
        format: (value: bigint) => string;
    };
};

// Covert to a float with decimal point precision
function formatFloat(value: bigint, decimals: number): string {
    const formattedValue = (Number(value) / Math.pow(10, decimals)).toFixed(decimals);
    const [intPart, fracPart] = formattedValue.split(".");
    const intWithCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return fracPart !== undefined ? `${intWithCommas}.${fracPart}` : intWithCommas;
}

// Format Unix UTC Epoch to EST timestamp
function formatTimestamp(epoch: bigint): string {
    const date = new Date(Number(epoch) * 1000);
    return date.toLocaleString("en-US", { timeZone: "America/New_York" });
}

async function main() {
    // Define contract address, share classes, and key details
    const addresses = {
        sepolia: "0xCC75D07cBC86f306A033af29508a1b98E2178264",
        mainnet: "0x7B0eC8D1D1254358A77f107118e96885EdDCEb16",
    };

    const shareClasses = [
        { id: 1, name: "Aggregated Data" },
        { id: 2, name: "Ethereum - A" },
        { id: 3, name: "Aptos" },
        { id: 4, name: "Arbitrum" },
        { id: 5, name: "Avalanche" },
        { id: 6, name: "Optimism’s OP" },
        { id: 7, name: "Polygon" },
        { id: 8, name: "Ethereum - I" },
        { id: 9, name: "Solana" },
        { id: 10, name: "BNB Chain" },
    ];

    const keyDetails: KeyDetails = {
        1: {
            name: "NAV Value",
            format: (value) => formatFloat(value, 2),
        },
        2: {
            name: "Shares Outstanding",
            format: (value) => formatFloat(value, 6),
        },
        3: {
            name: "Last Update Timestamp",
            format: formatTimestamp,
        },
        4: {
            name: "Valuation Date",
            format: formatTimestamp,
        },
        5: {
            name: "Effective Until Timestamp",
            format: formatTimestamp,
        },
        6: {
            name: "Daily Distribution Rate",
            format: (value) => formatFloat(value, 9),
        },
    };

    // Connect to the contract
    const currentNetwork = network.name;
    const address = addresses[currentNetwork];
    if (!address) {
        throw new Error(`No address configured for network: ${currentNetwork}`);
    }

    console.log(`Using address: ${address} on network: ${currentNetwork}`);
    const contract = await ethers.getContractAt("IBNYDataConsumerV2", address);

    // Iterate over all share classes and fetch data
    const tableData = [];

    for (const shareClass of shareClasses) {
        console.log(`Fetching data for Share Class: ${shareClass.name} (ID: ${shareClass.id})`);

        for (let key = 1; key <= 6; key++) {
            let rawValue: string;
            let formattedValue: string;

            try {
                const value = await contract.getUint256(shareClass.id, key);
                rawValue = value.toString();
                formattedValue = keyDetails[key].format(BigInt(value.toString()));
            } catch (error) {
                const { errorName, data } = error;
                // console.log(error);

                if (
                    error.code === "CALL_EXCEPTION" &&
                    errorName &&
                    ["LatestDataDelayed", "DataNotSet", "InvalidDataType"].includes(errorName)
                ) {
                    rawValue = `${(<String>data).slice(0, 10)}`;
                    formattedValue = `Error: ${errorName}`;
                } else {
                    console.error(
                        `Error fetching data for share class ${shareClass} and key ${key}:`,
                        error
                    );
                    rawValue = `Error`;
                    formattedValue = `Error`;
                }
            }

            tableData.push({
                "Share Class ID": shareClass.id,
                "Share Class Name": shareClass.name,
                Key: key,
                "Field Name": keyDetails[key].name,
                "On-chain Value": rawValue,
                "Formatted Value": formattedValue,
            });
        }
        tableData.push({});
    }

    console.table(tableData);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
```

##### Execution
To execute the provided script run in the shell: 
1. `npx hardhat compile` - to compile the contracts
2. `npx hardhat run .\scripts\offchain-consumer.ts --network sepolia` - to execute the off-chain consumer script.

##### Example Result

| index | Share Class ID | Share Class Name | Key | Field Name | On-chain Value | Formatted Value |
| ----------- | ----------- | ----------- | ----------- | ----------- | ----------- | ----------- |
| 7 | 2 | 'Ethereum - A' | 1 | 'NAV Value' | '100' | '1.00' |
| 8 | 2 | 'Ethereum - A' | 2 | 'Shares Outstanding' | '2878306530330000' | '2,878,306,530.330000' |
| 9 | 2 | 'Ethereum - A' | 3 | 'Last Update Timestamp' | '1743715725' | '4/3/2025, 5:28:45 PM' |
| 10 | 2 | 'Ethereum - A' | 4 | 'Valuation Date' | '1743652800' | '4/3/2025, 12:00:00 AM' |
| 11 | 2 | 'Ethereum - A' | 5 | 'Effective Until Timestamp' | '1743791400' | '4/4/2025, 2:30:00 PM' |
| 12 | 2 | 'Ethereum - A' | 6 | 'Daily Distribution Rate' | '106064' | '0.000106064' |

