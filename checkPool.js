const { ethers } = require("ethers");

// Base RPC URL
const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");

// Contract Addresses (Standardized with getAddress to fix checksum errors)
const GREG_TOKEN = ethers.getAddress("0x17027a052bc7e494fa007e5b15b5df33246f2b5c");      // Your Creator Coin (GREGGARCIA72)
const ZORA_TOKEN = ethers.getAddress("0xD3678cBF905E5997a10710C1F4588DA91338340d");      // Zora Token
const YOUR_WALLET = ethers.getAddress("0x60b244addceb96b81f9e0b93316f1eb94e80e8dd");     // Your Creator/Funding Wallet

// Canonical Uniswap V4 PoolManager Address on Base
const POOL_MANAGER_ADDRESS = ethers.getAddress("0x498581ff718922c3f8e6a244956af099b2652b2b"); 

// Minimal ABIs
const erc20Abi = ["function balanceOf(address owner) view returns (uint256)"];
const poolManagerAbi = [
    "function slots(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint8 feeProtocol, uint8 hookFee)"
];

// Helper to compute Uniswap V4 PoolId
function computePoolId(tokenA, tokenB, fee, tickSpacing, hooksAddress) {
    const [t0, t1] = BigInt(tokenA) < BigInt(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA];
    return ethers.solidityPackedKeccak256(
        ["address", "address", "uint24", "int24", "address"],
        [t0, t1, fee, tickSpacing, hooksAddress]
    );
}

async function checkV4Liquidity() {
    console.log("Initializing Uniswap V4 State Lookup...");

    const manager = new ethers.Contract(POOL_MANAGER_ADDRESS, poolManagerAbi, provider);
    const gregContract = new ethers.Contract(GREG_TOKEN, erc20Abi, provider);
    const zoraContract = new ethers.Contract(ZORA_TOKEN, erc20Abi, provider);

    // Common V4 Configs (Fee tier, Tick Spacing, Hooks Architecture)
    const configurations = [
        { fee: 10000, tickSpacing: 200, hook: ethers.ZeroAddress }, // 1% no hooks
        { fee: 3000, tickSpacing: 60, hook: ethers.ZeroAddress },  // 0.3% no hooks
        { fee: 10000, tickSpacing: 200, hook: GREG_TOKEN }          // Self-hooked
    ];

    let foundPoolId = null;
    let poolState = null;

    for (const config of configurations) {
        const poolId = computePoolId(GREG_TOKEN, ZORA_TOKEN, config.fee, config.tickSpacing, config.hook);
        try {
            const slotData = await manager.slots(poolId);
            if (slotData.sqrtPriceX96.toString() !== "0") {
                foundPoolId = poolId;
                poolState = slotData;
                console.log(`\n✅ Pool Located!`);
                console.log(`PoolId: ${poolId}`);
                console.log(`Config: Fee ${config.fee / 10000}%, TickSpacing: ${config.tickSpacing}, Hook: ${config.hook}`);
                break;
            }
        } catch (e) {
            // Check next configuration
        }
    }

    if (!foundPoolId) {
        console.log("\n❌ No active Uniswap V4 matching layouts found in standard parameters.");
        console.log("Your coin might still be in its native Zora bonding curve phase before pool initialization.");
    } else {
        console.log("\n--- Pool Status ---");
        console.log(`Price Parameter (sqrtPriceX96): ${poolState.sqrtPriceX96.toString()}`);
        console.log(`Current Tick: ${poolState.tick}`);
    }

    try {
        // Look up balances inside the V4 Singleton Vault
        const gregVault = await gregContract.balanceOf(POOL_MANAGER_ADDRESS);
        const zoraVault = await zoraContract.balanceOf(POOL_MANAGER_ADDRESS);
        const walletGreg = await gregContract.balanceOf(YOUR_WALLET);

        console.log("\n--- Vault Reserves ---");
        console.log(`GREGGARCIA72 in Pool Vault: ${ethers.formatUnits(gregVault, 18)}`);
        console.log(`ZORA in Pool Vault: ${ethers.formatUnits(zoraVault, 18)}`);
        console.log(`\nYour Wallet Balance: ${ethers.formatUnits(walletGreg, 18)} GREGGARCIA72`);
    } catch (err) {
        console.error("Error reading token parameters:", err.message);
    }
}

checkV4Liquidity();
