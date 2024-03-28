import {
  Cluster,
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
  AddressLookupTableAccount,
  ComputeBudgetProgram,
  VersionedTransaction,
  TransactionMessage,
  RpcResponseAndContext,
  SignatureResult,
  SimulatedTransactionResponse,
} from "@solana/web3.js";
import base58 from "bs58";
import path from "path";
import { readFile, appendFile } from "fs/promises";

// Default value from Solana CLI
const DEFAULT_FILEPATH = "~/.config/solana/id.json";
const DEFAULT_AIRDROP_AMOUNT = 1 * LAMPORTS_PER_SOL;
const DEFAULT_MINIMUM_BALANCE = 0.5 * LAMPORTS_PER_SOL;
const DEFAULT_ENV_KEYPAIR_VARIABLE_NAME = "PRIVATE_KEY";

const getErrorFromRPCResponse = (
  rpcResponse: RpcResponseAndContext<
    SignatureResult | SimulatedTransactionResponse
  >,
) => {
  // Note: `confirmTransaction` does not throw an error if the confirmation does not succeed,
  // but rather a `TransactionError` object. so we handle that here
  // See https://solana-labs.github.io/solana-web3.js/classes/Connection.html#confirmTransaction.confirmTransaction-1

  const error = rpcResponse.value.err;
  if (error) {
    // Can be a string or an object (literally just {}, no further typing is provided by the library)
    // https://github.com/solana-labs/solana-web3.js/blob/4436ba5189548fc3444a9f6efb51098272926945/packages/library-legacy/src/connection.ts#L2930
    // TODO: if still occurs in web3.js 2 (unlikely), fix it.
    if (typeof error === "object") {
      const errorKeys = Object.keys(error);
      if (errorKeys.length === 1) {
        if (errorKeys[0] !== "InstructionError") {
          throw new Error(`Unknown RPC error: ${error}`);
        }
        // @ts-ignore due to missing typing information mentioned above.
        const instructionError = error["InstructionError"];
        // An instruction error is a custom program error and looks like:
        // [
        //   1,
        //   {
        //     "Custom": 1
        //   }
        // ]
        // See also https://solana.stackexchange.com/a/931/294
        throw new Error(
          `Error in transaction: instruction index ${instructionError[0]}, custom program error ${instructionError[1]["Custom"]}`,
        );
      }
    }
    throw Error(error.toString());
  }
};

export const keypairToSecretKeyJSON = (keypair: Keypair): string => {
  return JSON.stringify(Array.from(keypair.secretKey));
};

export const getCustomErrorMessage = (
  possibleProgramErrors: Array<string>,
  errorMessage: string,
): string | null => {
  const customErrorExpression =
    /.*custom program error: 0x(?<errorNumber>[0-9abcdef]+)/;

  let match = customErrorExpression.exec(errorMessage);
  const errorNumberFound = match?.groups?.errorNumber;
  if (!errorNumberFound) {
    return null;
  }
  // errorNumberFound is a base16 string
  const errorNumber = parseInt(errorNumberFound, 16);
  return possibleProgramErrors[errorNumber] || null;
};

const encodeURL = (baseUrl: string, searchParams: Record<string, string>) => {
  // This was a little new to me, but it's the
  // recommended way to build URLs with query params
  // (and also means you don't have to do any encoding)
  // https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
  const url = new URL(baseUrl);
  url.search = new URLSearchParams(searchParams).toString();
  return url.toString();
};

export const getExplorerLink = (
  linkType: "transaction" | "tx" | "address" | "block",
  id: string,
  cluster: Cluster | "localnet" = "mainnet-beta",
): string => {
  const searchParams: Record<string, string> = {};
  if (cluster !== "mainnet-beta") {
    if (cluster === "localnet") {
      // localnet technically isn't a cluster, so requires special handling
      searchParams["cluster"] = "custom";
      searchParams["customUrl"] = "http://localhost:8899";
    } else {
      searchParams["cluster"] = cluster;
    }
  }
  let baseUrl: string = "";
  if (linkType === "address") {
    baseUrl = `https://explorer.solana.com/address/${id}`;
  }
  if (linkType === "transaction" || linkType === "tx") {
    baseUrl = `https://explorer.solana.com/tx/${id}`;
  }
  if (linkType === "block") {
    baseUrl = `https://explorer.solana.com/block/${id}`;
  }
  return encodeURL(baseUrl, searchParams);
};

export const getKeypairFromFile = async (filepath?: string) => {
  // Work out correct file name
  if (!filepath) {
    filepath = DEFAULT_FILEPATH;
  }
  if (filepath[0] === "~") {
    const home = process.env.HOME || null;
    if (home) {
      filepath = path.join(home, filepath.slice(1));
    }
  }

  // Get contents of file
  let fileContents: string;
  try {
    const fileContentsBuffer = await readFile(filepath);
    fileContents = fileContentsBuffer.toString();
  } catch (error) {
    throw new Error(`Could not read keypair from file at '${filepath}'`);
  }

  // Parse contents of file
  let parsedFileContents: Uint8Array;
  try {
    parsedFileContents = Uint8Array.from(JSON.parse(fileContents));
  } catch (thrownObject) {
    const error = thrownObject as Error;
    if (!error.message.includes("Unexpected token")) {
      throw error;
    }
    throw new Error(`Invalid secret key file at '${filepath}'!`);
  }
  return Keypair.fromSecretKey(parsedFileContents);
};

export const getKeypairFromEnvironment = (variableName: string) => {
  const secretKeyString = process.env[variableName];
  if (!secretKeyString) {
    throw new Error(`Please set '${variableName}' in environment.`);
  }

  // Try the shorter base58 format first
  let decodedSecretKey: Uint8Array;
  try {
    decodedSecretKey = base58.decode(secretKeyString);
    return Keypair.fromSecretKey(decodedSecretKey);
  } catch (throwObject) {
    const error = throwObject as Error;
    if (!error.message.includes("Non-base58 character")) {
      throw new Error(
        `Invalid secret key in environment variable '${variableName}'!`,
      );
    }
  }

  // Try the longer JSON format
  try {
    decodedSecretKey = Uint8Array.from(JSON.parse(secretKeyString));
  } catch (error) {
    throw new Error(
      `Invalid secret key in environment variable '${variableName}'!`,
    );
  }
  return Keypair.fromSecretKey(decodedSecretKey);
};

export const addKeypairToEnvFile = async (
  keypair: Keypair,
  variableName: string,
  envFileName?: string,
) => {
  if (!envFileName) {
    envFileName = ".env";
  }
  const existingSecretKey = process.env[variableName];
  if (existingSecretKey) {
    throw new Error(`'${variableName}' already exists in env file.`);
  }
  const secretKeyString = keypairToSecretKeyJSON(keypair);
  await appendFile(envFileName, `\n${variableName}=${secretKeyString}`);
};

export interface InitializeKeypairOptions {
  envFileName?: string;
  envVariableName?: string;
  airdropAmount?: number;
  minimumBalance?: number;
  keypairPath?: string;
}

export const initializeKeypair = async (
  connection: Connection,
  options?: InitializeKeypairOptions,
): Promise<Keypair> => {
  let {
    envFileName,
    envVariableName,
    airdropAmount,
    minimumBalance,
    keypairPath,
  } = options || {};

  let keypair: Keypair;
  envVariableName = envVariableName || DEFAULT_ENV_KEYPAIR_VARIABLE_NAME;

  if (keypairPath) {
    keypair = await getKeypairFromFile(keypairPath);
  } else if (process.env[envVariableName]) {
    keypair = getKeypairFromEnvironment(envVariableName);
  } else {
    keypair = Keypair.generate();
    await addKeypairToEnvFile(keypair, envVariableName, envFileName);
  }

  await airdropIfRequired(
    connection,
    keypair.publicKey,
    airdropAmount || DEFAULT_AIRDROP_AMOUNT,
    minimumBalance || DEFAULT_MINIMUM_BALANCE,
  );

  return keypair;
};

// Not exported as we don't want to encourage people to
// request airdrops when they don't need them, ie - don't bother
// the faucet unless you really need to!
const requestAndConfirmAirdrop = async (
  connection: Connection,
  publicKey: PublicKey,
  amount: number,
) => {
  const airdropTransactionSignature = await connection.requestAirdrop(
    publicKey,
    amount,
  );
  // Wait for airdrop confirmation
  const latestBlockHash = await connection.getLatestBlockhash();
  await connection.confirmTransaction(
    {
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropTransactionSignature,
    },
    // "finalized" is slow but we must be absolutely sure
    // the airdrop has gone through
    "finalized",
  );
  return connection.getBalance(publicKey, "finalized");
};

export const airdropIfRequired = async (
  connection: Connection,
  publicKey: PublicKey,
  airdropAmount: number,
  minimumBalance: number,
): Promise<number> => {
  const balance = await connection.getBalance(publicKey, "confirmed");
  if (balance < minimumBalance) {
    return requestAndConfirmAirdrop(connection, publicKey, airdropAmount);
  }
  return balance;
};

export const confirmTransaction = async (
  connection: Connection,
  signature: string,
): Promise<string> => {
  const block = await connection.getLatestBlockhash();
  const rpcResponse = await connection.confirmTransaction(
    {
      signature,
      ...block,
    },
    "confirmed",
  );

  getErrorFromRPCResponse(rpcResponse);

  return signature;
};

// Shout out to Dean from WBA for this technique
export const makeKeypairs = (amount: number): Array<Keypair> => {
  return Array.from({ length: amount }, () => Keypair.generate());
};

export const getLogs = async (
  connection: Connection,
  tx: string,
): Promise<Array<string>> => {
  await confirmTransaction(connection, tx);
  const txDetails = await connection.getTransaction(tx, {
    maxSupportedTransactionVersion: 0,
    commitment: "confirmed",
  });
  return txDetails?.meta?.logMessages || [];
};

// Was getSimulationUnits
// Credit https://twitter.com/stegabob, originally from
// https://x.com/stegaBOB/status/1766662289392889920
export const getSimulationComputeUnits = async (
  connection: Connection,
  instructions: Array<TransactionInstruction>,
  payer: PublicKey,
  lookupTables: Array<AddressLookupTableAccount> | [],
): Promise<number | null> => {
  const testInstructions = [
    // Set an arbitrarily high number in simulation
    // so we can be sure the transaction will succeed
    // and get the real compute units used
    ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }),
    ...instructions,
  ];

  const testTransaction = new VersionedTransaction(
    new TransactionMessage({
      instructions: testInstructions,
      payerKey: payer,
      // It seems that recentBlockhash can by any public key duiring simulation
      recentBlockhash: PublicKey.default.toString(),
    }).compileToV0Message(lookupTables),
  );

  const rpcResponse = await connection.simulateTransaction(testTransaction, {
    replaceRecentBlockhash: true,
    sigVerify: false,
  });

  getErrorFromRPCResponse(rpcResponse);
  return rpcResponse.value.unitsConsumed || null;
};
