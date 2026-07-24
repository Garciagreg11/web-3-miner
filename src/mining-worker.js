let mining = false;
let isPaused = false;
let totalHashes = 0;
let startTime = Date.now();

// Standard Keccak-256 implementation
function keccak256(hexInput) {
    let cleanHex = hexInput.startsWith('0x') ? hexInput.slice(2) : hexInput;
    if (cleanHex.length % 2 !== 0) cleanHex = '0' + cleanHex;

    const msg = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < msg.length; i++) {
        msg[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
    }

    const RATE = 136;
    const len = msg.length;
    let blocks = Math.floor(len / RATE) + 1;
    let paddedLen = blocks * RATE;
    let padded = new Uint8Array(paddedLen);
    padded.set(msg);

    padded[len] ^= 0x01;
    padded[paddedLen - 1] ^= 0x80;

    let state = new BigUint64Array(25);

    const RC = [
        0x0000000000000001n, 0x0000000000008082n, 0x800000000000808an, 0x8000000080008000n,
        0x000000000000808bn, 0x0000000080000001n, 0x8000000080008081n, 0x8000000000008009n,
        0x000000000000008an, 0x0000000000000088n, 0x0000000080008009n, 0x000000008000000an,
        0x000000008000808bn, 0x800000000000008bn, 0x8000000000008089n, 0x8000000000008003n,
        0x8000000000008002n, 0x8000000000000080n, 0x000000000000800an, 0x800000008000000an,
        0x8000000080008081n, 0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n
    ];

    const R = [
        0, 36, 3, 41, 18, 1, 44, 10, 45, 2, 62, 6, 43, 15, 61, 28, 55, 25, 21, 56, 27, 20, 39, 8, 14
    ];

    for (let b = 0; b < blocks; b++) {
        for (let i = 0; i < RATE / 8; i++) {
            let lane = 0n;
            for (let j = 0; j < 8; j++) {
                lane |= BigInt(padded[b * RATE + i * 8 + j]) << BigInt(j * 8);
            }
            state[i] ^= lane;
        }

        for (let round = 0; round < 24; round++) {
            let C = new BigUint64Array(5);
            let D = new BigUint64Array(5);

            for (let x = 0; x < 5; x++) {
                C[x] = state[x] ^ state[x + 5] ^ state[x + 10] ^ state[x + 15] ^ state[x + 20];
            }

            for (let x = 0; x < 5; x++) {
                let nextX = (x + 1) % 5;
                let prevX = (x + 4) % 5;
                let rot = C[nextX];
                D[x] = C[prevX] ^ ((rot << 1n) | (rot >> 63n));
            }

            for (let i = 0; i < 25; i++) {
                state[i] ^= D[i % 5];
            }

            let B = new BigUint64Array(25);
            for (let x = 0; x < 5; x++) {
                for (let y = 0; y < 5; y++) {
                    let idx = x + 5 * y;
                    let rot = BigInt(R[idx]);
                    let val = state[idx];
                    let rotVal = (val << rot) | (val >> (64n - rot));
                    let nextIdx = y + 5 * ((2 * x + 3 * y) % 5);
                    B[nextIdx] = rotVal;
                }
            }

            for (let x = 0; x < 5; x++) {
                for (let y = 0; y < 5; y++) {
                    let idx = x + 5 * y;
                    state[idx] = B[idx] ^ ((~B[((x + 1) % 5) + 5 * y]) & B[((x + 2) % 5) + 5 * y]);
                }
            }

            state[0] ^= RC[round];
        }
    }

    let outHex = '';
    for (let i = 0; i < 4; i++) {
        let lane = state[i];
        for (let j = 0; j < 8; j++) {
            let byte = Number((lane >> BigInt(j * 8)) & 0xffn);
            outHex += byte.toString(16).padStart(2, '0');
        }
    }

    return '0x' + outHex;
}

self.onmessage = function (e) {
    const { cmd, challenge, target, userAddress } = e.data;

    if (cmd === 'START') {
        if (mining) return;
        mining = true;
        isPaused = false;
        totalHashes = 0;
        startTime = Date.now();

        mine(challenge, target, userAddress);
    } else if (cmd === 'PAUSE') {
        isPaused = true;
    } else if (cmd === 'RESUME') {
        isPaused = false;
    } else if (cmd === 'STOP') {
        mining = false;
        isPaused = false;
    }
};

function mine(challenge, target, userAddress) {
    let nonce = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));

    const targetString = (target && target.startsWith('0x') && target.length === 66)
        ? target
        : "0x0fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

    const targetBN = BigInt(targetString);

    function hashBatch() {
        if (!mining) return;

        if (isPaused) {
            setTimeout(hashBatch, 100);
            return;
        }

        const batchSize = 300;
        for (let i = 0; i < batchSize; i++) {
            nonce++;

            let nonceHex = nonce.toString(16).padStart(64, '0');
            const cleanAddress = (userAddress || "").toLowerCase().replace('0x', '').padStart(40, '0');

            // Solidity abi.encodePacked(miner, nonce) -> Address (20 bytes) + Nonce (32 bytes)
            const input = '0x' + cleanAddress + nonceHex;
            const computedHash = keccak256(input);
            const hashBN = BigInt(computedHash);

            if (hashBN <= targetBN) {
                isPaused = true;
                self.postMessage({
                    status: 'SHARE_FOUND',
                    nonce: nonce.toString(),
                    hash: computedHash
                });
                setTimeout(hashBatch, 0);
                return;
            }
        }

        totalHashes += batchSize;
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        const currentHashrate = Math.floor(totalHashes / (elapsedSeconds || 1));

        self.postMessage({
            status: 'PROGRESS',
            hashrate: currentHashrate,
            totalHashes: totalHashes
        });

        setTimeout(hashBatch, 0);
    }

    hashBatch();
}
