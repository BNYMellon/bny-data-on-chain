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
    const addresses: { [key: string]: string } = {
        sepolia: "0xCC75D07cBC86f306A033af29508a1b98E2178264",
        mainnet: "0x7B0eC8D1D1254358A77f107118e96885EdDCEb16",
    };

    const shareClasses = [
        { id: 1, name: "Aggregated Data" },
        { id: 2, name: "Ethereum - A" },
        { id: 3, name: "Aptos" },
        { id: 4, name: "Arbitrum" },
        { id: 5, name: "Avalanche" },
        { id: 6, name: "Optimism's OP" },
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
    const tableData: object[] = [];

    for (const shareClass of shareClasses) {
        console.log(`Fetching data for Share Class: ${shareClass.name} (ID: ${shareClass.id})`);

        for (let key = 1; key <= 6; key++) {
            let rawValue: string;
            let formattedValue: string;

            try {
                const value = await contract.getUint256(shareClass.id, key);
                rawValue = value.toString();
                formattedValue = keyDetails[key].format(BigInt(value.toString()));
            } catch (error: any) {
                const { errorName, data } = error;

                if (
                    error.code === "CALL_EXCEPTION" &&
                    errorName &&
                    ["LatestDataDelayed", "DataNotSet", "InvalidDataType"].includes(errorName)
                ) {
                    rawValue = `${(data as string).slice(0, 10)}`;
                    formattedValue = `Error: ${errorName}`;
                } else {
                    console.error(
                        `Error fetching data for share class ${shareClass.name} and key ${key}:`,
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
