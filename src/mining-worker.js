// src/mining-worker.js

let mining = false;
let totalHashes = 0;
let startTime = Date.now();

// A lightweight, zero-dependency Keccak256 implementation for the worker environment
const RC = [
    0x0000000000000001n, 0x0000000000008082n, 0x800000000000808an, 0x8000000080008000n,
    0x000000000000808bn, 0x0000000080000001n, 0x8000000080008081n, 0x8000000000008009n,
    0x000000000000008an, 0x0000000000000088n, 0x0000000080008009n, 0x000000008000000an,
    0x000000008000808bn, 0x800000000000008bn, 0x8000000000008089n, 0x8000000000008003n,
    0x8000000000008002n, 0x8000000000000080n, 0x000000000000800an, 0x800000008000000an,
    0x8000000080008081n, 0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n
];

const r = [
    [0, 1, 62, 28, 27], [36, 44, 6, 55, 20], [3, 10, 43, 25, 39], [41, 45, 15, 21, 8], [18, 2, 61, 56, 14]
];

function keccak256(hexInput) {
    let cleanHex = hexInput.startsWith('0x') ? hexInput.slice(2) : hexInput;
    if (cleanHex.length % 2 !== 0) cleanHex = '0' + cleanHex;
    
    let bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
    }
    
    let padded = new Uint8Array(200);
    padded.set(bytes);
    padded[bytes.length] = 0x01;
    padded[135] |= 0x80;

    let state = Array(5).fill(0).map(() => Array(5).fill(0n));
    for (let i = 0; i < 17; i++) {
        let lane = 0n;
        for (let j = 0; j < 8; j++) {
            lane |= BigInt(padded[i * 8 + j]) << BigInt(j * 8);
        }
        state[i % 5][Math.floor(i / 5)] = lane;
    }

    // Keccak-f[1600] permutation
    for (let round = 0; round < 24; round++) {
        let C = Array(5).fill(0n);
        let D = Array(5).fill(0n);
        for (let x = 0; x < 5; x++) {
            C[x] = state[x][0] ^ state[x][1] ^ state[x][2] ^ state[x][3] ^ state[x][4];
        }
        for (let x = 0; x < 5; x++) {
            let nextX = (x + 1) % 5;
            let prevX = (x + 4) % 5;
            D[x] = C[prevX] ^ ((C[nextX] << 1n) | (C[nextX] >> 63n));
        }
        for (let x = 0; x < 5; x++) {
            for (let y = 0; y < 5; y++) {
                state[x][y] ^= D[x];
            }
        }
        let nextState = Array(5).fill(0).map(() => Array(5).fill(0n));
        for (let x = 0; x < 5; x++) {
            for (let y = 0; y < 5; y++) {
                let shift = BigInt(r[x][y]);
                nextState[y][(2 * x + 3 * y) % 5] = ((state[x][y] << shift) | (state[x][y] >> (64n - shift)));
            }
        }
        for (let x = 0; x < 5; x++) {
            for (let y = 0; y < 5; y++) {
                state[x][y] = nextState[x][y] ^ ((~nextState[(x + 1) % 5][y]) & nextState[(x + 2) % 5][y]);
            }
        }
        state[0][0] ^= RC[round];
    }

    let outHex = '';
    for (let i = 0; i < 4; i++) {
        let lane = state[i % 5][Math.floor(i / 5)];
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
        totalHashes = 0;
        startTime = Date.now();

        mine(challenge, target, userAddress);
    } else if (cmd === 'STOP') {
        mining = false;
    }
};

function mine(challenge, target, userAddress) {
    let nonce = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));

    const targetString = target && target.startsWith('0x') ? target : "0x0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
    const targetBN = BigInt(targetString);

    function hashBatch() {
        if (!mining) return;

        const batchSize = 200; 
        for (let i = 0; i < batchSize; i++) {
            nonce++;

            // Pad the nonce out to 64 characters (32 bytes) to match Solidity abi.encodePacked uint256 spacing
            let nonceHex = nonce.toString(16).padStart(64, '0');

            const cleanChallenge = (challenge || "").startsWith('0x') ? challenge.slice(2) : (challenge || "");
            const cleanAddress = (userAddress || "").startsWith('0x') ? userAddress.slice(2) : (userAddress || "");
            
            const input = '0x' + cleanChallenge.toLowerCase() + cleanAddress.toLowerCase() + nonceHex;
            const computedHash = keccak256(input);
            const hashBN = BigInt(computedHash);

            if (hashBN <= targetBN) {
                mining = false;
                self.postMessage({
                    status: 'SHARE_FOUND',
                    nonce: nonce.toString(),
                    hash: computedHash
                });
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
