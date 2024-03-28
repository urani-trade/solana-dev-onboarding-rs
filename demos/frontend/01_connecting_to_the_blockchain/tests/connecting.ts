import { Connection, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));
console.log(`✅ Connected!`)

let slot = await connection.getSlot();
console.log('✅ Current slot:', slot);

let blockTime = await connection.getBlockTime(slot);
console.log('✅ Current block time:', blockTime);

let block = await connection.getBlock(slot);
console.log('✅ Current block:', block);

let slotLeader = await connection.getSlotLeader();
console.log('✅ Current slot leader:', slotLeader);