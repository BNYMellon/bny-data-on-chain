import { expect } from "chai";
import { ethers } from "hardhat";
import { MockBNYDataOracle } from "../typechain-types";

describe("BNY Data On-Chain", function () {
    let oracle: MockBNYDataOracle;

    // Sample data matching the README example result
    const SHARE_CLASS_ETH = 2; // Ethereum - A
    const SHARE_CLASS_AGG = 1; // Aggregated Data

    const sampleData = {
        nav: 100n,                      // NAV — $1.00 (2 decimal precision)
        sharesOutstanding: 2878306530330000n, // 2,878,306,530.330000 (6 decimal precision)
        lastUpdate: 1733355683n,        // Timestamp
        valuationDate: 1733288400n,     // Timestamp
        effectiveUntil: 1733427000n,    // Timestamp
        dailyDistRate: 106064n,         // 0.000106064 (9 decimal precision)
    };

    beforeEach(async function () {
        const OracleFactory = await ethers.getContractFactory("MockBNYDataOracle");
        oracle = await OracleFactory.deploy();

        // Populate Ethereum - A share class (key 2) with sample data
        await oracle.setUint256(SHARE_CLASS_ETH, 1, sampleData.nav);
        await oracle.setUint256(SHARE_CLASS_ETH, 2, sampleData.sharesOutstanding);
        await oracle.setUint256(SHARE_CLASS_ETH, 3, sampleData.lastUpdate);
        await oracle.setUint256(SHARE_CLASS_ETH, 4, sampleData.valuationDate);
        await oracle.setUint256(SHARE_CLASS_ETH, 5, sampleData.effectiveUntil);
        await oracle.setUint256(SHARE_CLASS_ETH, 6, sampleData.dailyDistRate);
    });

    describe("Data Retrieval", function () {
        it("should return correct NAV value", async function () {
            const nav = await oracle.getUint256(SHARE_CLASS_ETH, 1);
            expect(nav).to.equal(sampleData.nav);
        });

        it("should return correct Shares Outstanding", async function () {
            const shares = await oracle.getUint256(SHARE_CLASS_ETH, 2);
            expect(shares).to.equal(sampleData.sharesOutstanding);
        });

        it("should return correct Last Update Timestamp", async function () {
            const ts = await oracle.getUint256(SHARE_CLASS_ETH, 3);
            expect(ts).to.equal(sampleData.lastUpdate);
        });

        it("should return correct Valuation Date", async function () {
            const vd = await oracle.getUint256(SHARE_CLASS_ETH, 4);
            expect(vd).to.equal(sampleData.valuationDate);
        });

        it("should return correct Effective Until Timestamp", async function () {
            const eu = await oracle.getUint256(SHARE_CLASS_ETH, 5);
            expect(eu).to.equal(sampleData.effectiveUntil);
        });

        it("should return correct Daily Distribution Rate", async function () {
            const ddr = await oracle.getUint256(SHARE_CLASS_ETH, 6);
            expect(ddr).to.equal(sampleData.dailyDistRate);
        });

        it("should return all 6 data fields for a share class", async function () {
            const values = await Promise.all(
                [1, 2, 3, 4, 5, 6].map((key) => oracle.getUint256(SHARE_CLASS_ETH, key))
            );
            expect(values).to.deep.equal([
                sampleData.nav,
                sampleData.sharesOutstanding,
                sampleData.lastUpdate,
                sampleData.valuationDate,
                sampleData.effectiveUntil,
                sampleData.dailyDistRate,
            ]);
        });
    });

    describe("Data Types", function () {
        it("should return UINT256 type for set data fields", async function () {
            const dataType = await oracle.getType(SHARE_CLASS_ETH, 1);
            expect(dataType).to.equal(2); // DataType.UINT256 = 2
        });

        it("should return NOT_SET type for unset data fields", async function () {
            const dataType = await oracle.getType(SHARE_CLASS_ETH, 99);
            expect(dataType).to.equal(0); // DataType.NOT_SET = 0
        });
    });

    describe("Error: DataNotSet", function () {
        it("should revert with DataNotSet when querying an unset field", async function () {
            await expect(oracle.getUint256(SHARE_CLASS_AGG, 1))
                .to.be.revertedWithCustomError(oracle, "DataNotSet")
                .withArgs(SHARE_CLASS_AGG, 1);
        });

        it("should revert with DataNotSet after data is cleared", async function () {
            await oracle.clearData(SHARE_CLASS_ETH, 1);
            await expect(oracle.getUint256(SHARE_CLASS_ETH, 1))
                .to.be.revertedWithCustomError(oracle, "DataNotSet")
                .withArgs(SHARE_CLASS_ETH, 1);
        });
    });

    describe("Error: LatestDataDelayed", function () {
        it("should revert with LatestDataDelayed when oracle is suspended", async function () {
            await oracle.suspend();
            await expect(oracle.getUint256(SHARE_CLASS_ETH, 1))
                .to.be.revertedWithCustomError(oracle, "LatestDataDelayed");
        });

        it("should resume normal operation after resume is called", async function () {
            await oracle.suspend();
            await oracle.resume();
            const nav = await oracle.getUint256(SHARE_CLASS_ETH, 1);
            expect(nav).to.equal(sampleData.nav);
        });
    });

    describe("Error: InvalidDataType", function () {
        it("should revert with InvalidDataType when using wrong getter", async function () {
            // NAV is set as UINT256, querying with getString32 should fail
            await expect(oracle.getString32(SHARE_CLASS_ETH, 1))
                .to.be.revertedWithCustomError(oracle, "InvalidDataType")
                .withArgs(SHARE_CLASS_ETH, 1);
        });

        it("should revert when using getBytes32 on a UINT256 field", async function () {
            await expect(oracle.getBytes32(SHARE_CLASS_ETH, 1))
                .to.be.revertedWithCustomError(oracle, "InvalidDataType")
                .withArgs(SHARE_CLASS_ETH, 1);
        });

        it("should revert when using getInt256 on a UINT256 field", async function () {
            await expect(oracle.getInt256(SHARE_CLASS_ETH, 1))
                .to.be.revertedWithCustomError(oracle, "InvalidDataType")
                .withArgs(SHARE_CLASS_ETH, 1);
        });
    });

    describe("Events", function () {
        it("should emit DataSet when data is set", async function () {
            await expect(oracle.setUint256(SHARE_CLASS_AGG, 1, 42n))
                .to.emit(oracle, "DataSet")
                .withArgs(SHARE_CLASS_AGG, 1, 2); // DataType.UINT256 = 2
        });

        it("should emit DataUpdated when data is set", async function () {
            const value = ethers.zeroPadValue(ethers.toBeHex(42n), 32);
            await expect(oracle.setUint256(SHARE_CLASS_AGG, 1, 42n))
                .to.emit(oracle, "DataUpdated")
                .withArgs(SHARE_CLASS_AGG, 1, value);
        });

        it("should emit DataCleared when data is cleared", async function () {
            await expect(oracle.clearData(SHARE_CLASS_ETH, 1))
                .to.emit(oracle, "DataCleared")
                .withArgs(SHARE_CLASS_ETH, 1);
        });

        it("should emit Suspended when oracle is suspended", async function () {
            const [signer] = await ethers.getSigners();
            await expect(oracle.suspend())
                .to.emit(oracle, "Suspended")
                .withArgs(signer.address);
        });

        it("should emit Resumed when oracle is resumed", async function () {
            const [signer] = await ethers.getSigners();
            await oracle.suspend();
            await expect(oracle.resume())
                .to.emit(oracle, "Resumed")
                .withArgs(signer.address);
        });
    });
});
