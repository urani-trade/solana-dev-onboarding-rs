import { before, describe, test } from "node:test";
import {
  getKeypairFromEnvironment,
  getKeypairFromFile,
  addKeypairToEnvFile,
  getCustomErrorMessage,
  airdropIfRequired,
  getExplorerLink,
  confirmTransaction,
  makeKeypairs,
  InitializeKeypairOptions,
  initializeKeypair,
  getLogs,
  getSimulationComputeUnits,
} from "./index";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import assert from "node:assert/strict";
import base58 from "bs58";
// See https://m.media-amazon.com/images/I/51TJeGHxyTL._SY445_SX342_.jpg
import { exec as execNoPromises } from "child_process";
import { promisify } from "util";
import { writeFile, unlink as deleteFile } from "node:fs/promises";
import dotenv from "dotenv";

const exec = promisify(execNoPromises);

const LOCALHOST = "http://127.0.0.1:8899";
const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
);
const TEMP_DIR = "src/temp";

describe(`getCustomErrorMessage`, () => {
  test(`we turn error messages with hex codes into error messages for the program`, () => {
    // This example set of error is from the token program
    // https://github.com/solana-labs/solana-program-library/blob/master/token/program/src/error.rs
    const programErrors = [
      "Lamport balance below rent-exempt threshold",
      "Insufficient funds",
      "Invalid Mint",
      "Account not associated with this Mint",
      "Owner does not match",
      "Fixed supply",
      "Already in use",
      "Invalid number of provided signers",
      "Invalid number of required signers",
      "State is unititialized",
      "Instruction does not support native tokens",
      "Non-native account can only be closed if its balance is zero",
      "Invalid instruction",
      "State is invalid for requested operation",
      "Operation overflowed",
      "Account does not support specified authority type",
      "This token mint cannot freeze accounts",
      "Account is frozen",
      "The provided decimals value different from the Mint decimals",
      "Instruction does not support non-native tokens",
    ];
    const errorMessage = getCustomErrorMessage(
      programErrors,
      "failed to send transaction: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x10",
    );
    assert.equal(errorMessage, "This token mint cannot freeze accounts");
  });
});

describe("getKeypairFromFile", () => {
  let TEST_FILE_NAME = `${TEMP_DIR}/test-keyfile-do-not-use.json`;
  let MISSING_FILE_NAME = "THIS FILE DOES NOT EXIST";
  let CORRUPT_TEST_FILE_NAME = `${TEMP_DIR}/corrupt-keyfile-do-not-use.json`;
  before(async () => {
    const { stdout } = await exec(
      `solana-keygen new --force --no-bip39-passphrase -o ${TEST_FILE_NAME}`,
    );
    assert(stdout.includes("Wrote new keypair"));

    await writeFile(CORRUPT_TEST_FILE_NAME, "I AM CORRUPT");
  });

  test("getting a keypair from a file", async () => {
    await getKeypairFromFile(TEST_FILE_NAME);
  });

  test("throws a nice error if the file is missing", async () => {
    assert.rejects(async () => await getKeypairFromFile(MISSING_FILE_NAME), {
      message: `Could not read keypair from file at '${MISSING_FILE_NAME}'`,
    });
  });

  test("throws a nice error if the file is corrupt", async () => {
    assert.rejects(() => getKeypairFromFile(CORRUPT_TEST_FILE_NAME), {
      message: `Invalid secret key file at '${CORRUPT_TEST_FILE_NAME}'!`,
    });
  });
});

describe("getKeypairFromEnvironment", () => {
  let TEST_ENV_VAR_ARRAY_OF_NUMBERS = "TEST_ENV_VAR_ARRAY_OF_NUMBERS";
  let TEST_ENV_VAR_BASE58 = "TEST_ENV_VAR_BASE58";
  let TEST_ENV_VAR_WITH_BAD_VALUE = "TEST_ENV_VAR_WITH_BAD_VALUE";

  before(async () => {
    const randomKeypair = Keypair.generate();

    process.env[TEST_ENV_VAR_ARRAY_OF_NUMBERS] = JSON.stringify(
      Object.values(randomKeypair.secretKey),
    );

    process.env[TEST_ENV_VAR_BASE58] = base58.encode(randomKeypair.secretKey);

    process.env[TEST_ENV_VAR_WITH_BAD_VALUE] =
      "this isn't a valid value for a secret key";
  });

  test("getting a keypair from an environment variable (array of numbers format)", async () => {
    await getKeypairFromEnvironment(TEST_ENV_VAR_ARRAY_OF_NUMBERS);
  });

  test("getting a keypair from an environment variable (base58 format)", async () => {
    await getKeypairFromEnvironment(TEST_ENV_VAR_BASE58);
  });

  test("throws a nice error if the env var doesn't exist", () => {
    assert.throws(() => getKeypairFromEnvironment("MISSING_ENV_VAR"), {
      message: `Please set 'MISSING_ENV_VAR' in environment.`,
    });
  });

  test("throws a nice error if the value of the env var isn't valid", () => {
    assert.throws(
      () => getKeypairFromEnvironment("TEST_ENV_VAR_WITH_BAD_VALUE"),
      {
        message: `Invalid secret key in environment variable 'TEST_ENV_VAR_WITH_BAD_VALUE'!`,
      },
    );
  });
});

describe("addKeypairToEnvFile", () => {
  let TEST_ENV_VAR_ARRAY_OF_NUMBERS = "TEST_ENV_VAR_ARRAY_OF_NUMBERS";
  let testKeypair: Keypair;

  before(async () => {
    testKeypair = Keypair.generate();

    process.env[TEST_ENV_VAR_ARRAY_OF_NUMBERS] = JSON.stringify(
      Object.values(testKeypair.secretKey),
    );
  });

  test("generates new keypair and writes to env if variable doesn't exist", async () => {
    // We need to use a specific file name to avoid conflicts with other tests
    const envFileName = ".env-unittest-addkeypairtoenvfile";
    await addKeypairToEnvFile(testKeypair, "TEMP_KEYPAIR", envFileName);

    // Now reload the environment and check it matches our test keypair
    dotenv.config({ path: envFileName });

    // Get the secret from the .env file
    const secretKeyString = process.env["TEMP_KEYPAIR"];

    if (!secretKeyString) {
      throw new Error("TEMP_KEYPAIR not found in environment");
    }
    const decodedSecretKey = Uint8Array.from(JSON.parse(secretKeyString));
    const envKeypair = Keypair.fromSecretKey(decodedSecretKey);

    assert.ok(envKeypair.secretKey);

    await deleteFile(envFileName);
  });

  test("throws a nice error if the env var already exists", async () => {
    assert.rejects(
      async () =>
        addKeypairToEnvFile(testKeypair, TEST_ENV_VAR_ARRAY_OF_NUMBERS),
      {
        message: `'TEST_ENV_VAR_ARRAY_OF_NUMBERS' already exists in env file.`,
      },
    );
  });
});

describe("initializeKeypair", () => {
  const connection = new Connection(LOCALHOST);
  const keypairVariableName = "INITIALIZE_KEYPAIR_TEST";

  test("generates a new keypair and airdrops needed amount", async () => {
    // We need to use a specific file name to avoid conflicts with other tests
    const envFileName = ".env-unittest-initkeypair";
    const options: InitializeKeypairOptions = {
      envFileName,
      envVariableName: keypairVariableName,
    };

    const signerFirstLoad = await initializeKeypair(connection, options);

    // Check balance
    const firstBalanceLoad = await connection.getBalance(
      signerFirstLoad.publicKey,
    );
    assert.ok(firstBalanceLoad > 0);

    // Check that the environment variable was created
    dotenv.config({ path: envFileName });
    const secretKeyString = process.env[keypairVariableName];
    if (!secretKeyString) {
      throw new Error(`${secretKeyString} not found in environment`);
    }

    // Now reload the environment and check it matches our test keypair
    const signerSecondLoad = await initializeKeypair(connection, options);

    // Check the keypair is the same
    assert.ok(signerFirstLoad.publicKey.equals(signerSecondLoad.publicKey));

    // Check balance has not changed
    const secondBalanceLoad = await connection.getBalance(
      signerSecondLoad.publicKey,
    );
    assert.equal(firstBalanceLoad, secondBalanceLoad);

    // Check there is a secret key
    assert.ok(signerSecondLoad.secretKey);

    await deleteFile(envFileName);
  });
});

describe("airdropIfRequired", () => {
  test("Checking the balance after airdropIfRequired", async () => {
    const keypair = Keypair.generate();
    const connection = new Connection(LOCALHOST);
    const originalBalance = await connection.getBalance(keypair.publicKey);
    assert.equal(originalBalance, 0);
    const lamportsToAirdrop = 1 * LAMPORTS_PER_SOL;

    const newBalance = await airdropIfRequired(
      connection,
      keypair.publicKey,
      lamportsToAirdrop,
      1 * LAMPORTS_PER_SOL,
    );

    assert.equal(newBalance, lamportsToAirdrop);

    const recipient = Keypair.generate();

    // Spend our SOL now to ensure we can use the airdrop immediately
    await connection.sendTransaction(
      new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: keypair.publicKey,
          toPubkey: recipient.publicKey,
          lamports: 500_000_000,
        }),
      ),
      [keypair],
    );
  });

  test("doesn't request unnecessary airdrops", async () => {
    const keypair = Keypair.generate();
    const connection = new Connection(LOCALHOST);
    const originalBalance = await connection.getBalance(keypair.publicKey);
    assert.equal(originalBalance, 0);
    const lamportsToAirdrop = 1 * LAMPORTS_PER_SOL;

    await airdropIfRequired(
      connection,
      keypair.publicKey,
      lamportsToAirdrop,
      500_000,
    );
    const finalBalance = await airdropIfRequired(
      connection,
      keypair.publicKey,
      lamportsToAirdrop,
      1 * LAMPORTS_PER_SOL,
    );
    // Check second airdrop didn't happen (since we only had 1 sol)
    assert.equal(finalBalance, 1 * lamportsToAirdrop);
  });

  test("airdropIfRequired does airdrop when necessary", async () => {
    const keypair = Keypair.generate();
    const connection = new Connection(LOCALHOST);
    const originalBalance = await connection.getBalance(keypair.publicKey);
    assert.equal(originalBalance, 0);
    // Get 999_999_999 lamports if we have less than 500_000 lamports
    const lamportsToAirdrop = 1 * LAMPORTS_PER_SOL - 1;
    await airdropIfRequired(
      connection,
      keypair.publicKey,
      lamportsToAirdrop,
      500_000,
    );
    // We only have 999_999_999 lamports, so we should need another airdrop
    const finalBalance = await airdropIfRequired(
      connection,
      keypair.publicKey,
      1 * LAMPORTS_PER_SOL,
      1 * LAMPORTS_PER_SOL,
    );
    // Check second airdrop happened
    assert.equal(finalBalance, 2 * LAMPORTS_PER_SOL - 1);
  });
});

describe("getExplorerLink", () => {
  test("getExplorerLink works for a block on mainnet", () => {
    const link = getExplorerLink("block", "242233124", "mainnet-beta");
    assert.equal(link, "https://explorer.solana.com/block/242233124");
  });

  test("getExplorerLink works for an address on mainnet", () => {
    const link = getExplorerLink(
      "address",
      "dDCQNnDmNbFVi8cQhKAgXhyhXeJ625tvwsunRyRc7c8",
      "mainnet-beta",
    );
    assert.equal(
      link,
      "https://explorer.solana.com/address/dDCQNnDmNbFVi8cQhKAgXhyhXeJ625tvwsunRyRc7c8",
    );
  });

  test("getExplorerLink works for an address on devnet", () => {
    const link = getExplorerLink(
      "address",
      "dDCQNnDmNbFVi8cQhKAgXhyhXeJ625tvwsunRyRc7c8",
      "devnet",
    );
    assert.equal(
      link,
      "https://explorer.solana.com/address/dDCQNnDmNbFVi8cQhKAgXhyhXeJ625tvwsunRyRc7c8?cluster=devnet",
    );
  });

  test("getExplorerLink works for a transaction on mainnet", () => {
    const link = getExplorerLink(
      "transaction",
      "4nzNU7YxPtPsVzeg16oaZvLz4jMPtbAzavDfEFmemHNv93iYXKKYAaqBJzFCwEVxiULqTYYrbjPwQnA1d9ZCTELg",
      "mainnet-beta",
    );
    assert.equal(
      link,
      "https://explorer.solana.com/tx/4nzNU7YxPtPsVzeg16oaZvLz4jMPtbAzavDfEFmemHNv93iYXKKYAaqBJzFCwEVxiULqTYYrbjPwQnA1d9ZCTELg",
    );
  });

  test("getExplorerLink works for a block on mainnet", () => {
    const link = getExplorerLink("block", "241889720", "mainnet-beta");
    assert.equal(link, "https://explorer.solana.com/block/241889720");
  });
});

describe("makeKeypairs", () => {
  test("makeKeypairs makes exactly the amount of keypairs requested", () => {
    // We could test more, but keypair generation takes time and slows down tests
    const KEYPAIRS_TO_MAKE = 3;
    const keypairs = makeKeypairs(KEYPAIRS_TO_MAKE);
    assert.equal(keypairs.length, KEYPAIRS_TO_MAKE);
    assert.ok(keypairs[KEYPAIRS_TO_MAKE - 1].secretKey);
  });

  test("makeKeypairs() creates the correct number of keypairs", () => {
    const keypairs = makeKeypairs(3);
    assert.equal(keypairs.length, 3);
  });
});

describe("confirmTransaction", () => {
  test("confirmTransaction works for a successful transaction", async () => {
    const connection = new Connection(LOCALHOST);
    const [sender, recipient] = [Keypair.generate(), Keypair.generate()];
    const lamportsToAirdrop = 2 * LAMPORTS_PER_SOL;
    await airdropIfRequired(
      connection,
      sender.publicKey,
      lamportsToAirdrop,
      1 * LAMPORTS_PER_SOL,
    );

    const transaction = await connection.sendTransaction(
      new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: sender.publicKey,
          toPubkey: recipient.publicKey,
          lamports: 1_000_000,
        }),
      ),
      [sender],
    );

    await confirmTransaction(connection, transaction);
  });
});

describe(`getLogs`, () => {
  test(`getLogs works`, async () => {
    const connection = new Connection(LOCALHOST);
    const [sender, recipient] = [Keypair.generate(), Keypair.generate()];
    const lamportsToAirdrop = 2 * LAMPORTS_PER_SOL;
    await airdropIfRequired(
      connection,
      sender.publicKey,
      lamportsToAirdrop,
      1 * LAMPORTS_PER_SOL,
    );

    const transaction = await connection.sendTransaction(
      new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: sender.publicKey,
          toPubkey: recipient.publicKey,
          lamports: 1_000_000,
        }),
      ),
      [sender],
    );

    const logs = await getLogs(connection, transaction);
    assert.deepEqual(logs, [
      "Program 11111111111111111111111111111111 invoke [1]",
      "Program 11111111111111111111111111111111 success",
    ]);
  });
});

describe("getSimulationComputeUnits", () => {
  test("getSimulationComputeUnits returns 300 CUs for a SOL transfer, and 3888 for a SOL transfer with a memo", async () => {
    const connection = new Connection(LOCALHOST);
    const sender = Keypair.generate();
    await airdropIfRequired(
      connection,
      sender.publicKey,
      1 * LAMPORTS_PER_SOL,
      1 * LAMPORTS_PER_SOL,
    );
    const recipient = Keypair.generate().publicKey;

    const sendSol = SystemProgram.transfer({
      fromPubkey: sender.publicKey,
      toPubkey: recipient,
      lamports: 1_000_000,
    });

    const sayThanks = new TransactionInstruction({
      keys: [],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from("thanks"),
    });

    const computeUnitsSendSol = await getSimulationComputeUnits(
      connection,
      [sendSol],
      sender.publicKey,
      [],
    );

    // TODO: it would be useful to have a breakdown of exactly how 300 CUs is calculated
    assert.equal(computeUnitsSendSol, 300);

    const computeUnitsSendSolAndSayThanks = await getSimulationComputeUnits(
      connection,
      [sendSol, sayThanks],
      sender.publicKey,
      [],
    );

    // TODO: it would be useful to have a breakdown of exactly how 3888 CUs is calculated
    // also worth reviewing why memo program seems to use so many CUs.
    assert.equal(computeUnitsSendSolAndSayThanks, 3888);
  });
});
