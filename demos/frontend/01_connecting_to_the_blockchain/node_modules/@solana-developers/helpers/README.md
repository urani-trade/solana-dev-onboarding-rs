# Solana helpers

The `helpers` package contains Solana helper functions, for use in the browser and/or node.js, [made by the Solana Foundation Developer Ecosystem team](https://youtu.be/zvQIa68ObK8?t=319) and our friends at [Anza](https://anza.xyz), [Turbin3](https://turbin3.com/), [Unboxed Software](https://beunboxed.com/) and [StarAtlas](https://staratlas.com/).

Eventually most of these will end up in `@solana/web3.js`.

## What can I do with this module?

[Make multiple keypairs at once](#make-multiple-keypairs-at-once)

[Resolve a custom error message](#resolve-a-custom-error-message)

[Get an airdrop if your balance is below some amount](#get-an-airdrop-if-your-balance-is-below-some-amount)

[Get a Solana Explorer link for a transaction, address, or block](#get-a-solana-explorer-link-for-a-transaction-address-or-block)

[Confirm a transaction](#confirm-a-transaction)

[Get the logs for a transaction](#get-the-logs-for-a-transaction)

[Get simulated compute units (CUs) for transaction instructions](<#get-simulated-compute-units-(cus)-for-transaction-instructions>)

[Get a keypair from a keypair file](#get-a-keypair-from-a-keypair-file)

[Get a keypair from an environment variable](#get-a-keypair-from-an-environment-variable)

[Add a new keypair to an env file](#add-a-new-keypair-to-an-env-file)

[Load or create a keypair and airdrop to it if needed](#load-or-create-a-keypair-and-airdrop-to-it-if-needed)

## Installation

```bash
npm i @solana-developers/helpers
```

## Contributing

PRs are very much welcome! Read the [CONTRIBUTING guidelines for the Solana course](https://github.com/Unboxed-Software/solana-course/blob/main/CONTRIBUTING.md#code) then send a PR!

## helpers for the browser and node.js

### Make multiple keypairs at once

Usage:

```typescript
makeKeypairs(amount);
```

In some situations - like making tests for your on-chain programs - you might need to make lots of keypairs at once. You can use `makeKeypairs()` combined with JS destructuring to quickly create multiple variables with distinct keypairs.

```typescript
const [sender, recipient] = makeKeypairs(2);
```

### Resolve a custom error message

Usage:

```typescript
getCustomErrorMessage(programErrors, errorMessage);
```

Sometimes Solana transactions throw an error with a message like:

> failed to send transaction: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x10

Usage:

```typescript
getCustomErrorMessage();
```

Allows you to turn this message into a more readable message from the custom program, like:

> This token mint cannot freeze accounts

Just:

- Get the errors from the specific program's `error.rs` file - for example, there are [the errors for the Token Program](https://github.com/solana-labs/solana-program-library/blob/master/token/program/src/error.rs)

- Save the errors into an array

```typescript
// Token program errors
// https://github.com/solana-labs/solana-program-library/blob/master/token/program/src/error.rs
const tokenProgramErrors = [
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
```

Then run:

```typescript
const errorMessage = getCustomErrorMessage(
  tokenProgramErrors,
  "failed to send transaction: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x10",
);
```

And `errorMessage` will now be:

```typescript
"This token mint cannot freeze accounts";
```

### Get an airdrop if your balance is below some amount

Usage:

```typescript
airdropIfRequired(connection, publicKey, lamports, maximumBalance);
```

Request and confirm an airdrop in one step. As soon as the `await` returns, the airdropped tokens will be ready in the address, and the new balance of tokens is returned. The `maximumBalance` is used to avoid errors caused by unnecessarily asking for SOL when there's already enough in the account, and makes `airdropIfRequired()` very handy in scripts that run repeatedly.

To ask for 0.5 SOL, if the balance is below 1 SOL, use:

```typescript
const newBalance = await airdropIfRequired(
  connection,
  keypair.publicKey,
  0.5 * LAMPORTS_PER_SOL,
  1 * LAMPORTS_PER_SOL,
);
```

### Get a Solana Explorer link for a transaction, address, or block

Usage:

```typescript
getExplorerLink(type, identifier, clusterName);
```

Get an explorer link for an `address`, `block` or `transaction` (`tx` works too).

```typescript
getExplorerLink(
  "address",
  "dDCQNnDmNbFVi8cQhKAgXhyhXeJ625tvwsunRyRc7c8",
  "mainnet-beta",
);
```

Will return `"https://explorer.solana.com/address/dDCQNnDmNbFVi8cQhKAgXhyhXeJ625tvwsunRyRc7c8"`. The cluster name isn't included since mainnet-beta is the default.

```typescript
getExplorerLink(
  "address",
  "dDCQNnDmNbFVi8cQhKAgXhyhXeJ625tvwsunRyRc7c8",
  "devnet",
);
```

Will return `"https://explorer.solana.com/address/dDCQNnDmNbFVi8cQhKAgXhyhXeJ625tvwsunRyRc7c8?cluster=devnet"`

```typescript
getExplorerLink("block", "241889720", "mainnet-beta");
```

Will return `"https://explorer.solana.com/block/241889720"`

### Confirm a transaction

Usage:

```typescript
confirmTransaction(connection, transaction);
```

Confirm a transaction, and also gets the recent blockhash required to confirm it.

```typescript
await confirmTransaction(connection, transaction);
```

### Get the logs for a transaction

Usage:

```typescript
getLogs(connection, transaction);
```

Get the logs for a transaction signature:

```typescript
const logs = await getLogs(connection, transaction);
```

The `logs` will be an array of strings, eg:

```typescript
[
  "Program 11111111111111111111111111111111 invoke [1]",
  "Program 11111111111111111111111111111111 success",
];
```

This a good way to assert your onchain programs return particular logs during unit tests.

### Get simulated compute units (CUs) for transaction instructions

Usage:

```typescript
getSimulationComputeUnits(connection, instructions, payer, lookupTables);
```

Get the compute units required for an array of instructions. Create your instructions:

```typescript
const sendSol = SystemProgram.transfer({
  fromPubkey: payer.publicKey,
  toPubkey: recipient,
  lamports: 1_000_000,
});
```

Then use `getSimulationComputeUnits` to get the number of compute units the instructions will use:

```typescript
const units = await getSimulationComputeUnits(
  connection,
  [sendSol],
  payer.publicKey,
);
```

You can then use `ComputeBudgetProgram.setComputeUnitLimit({ units })` as the first instruction in your transaction. See [How to Request Optimal Compute Budget](https://solana.com/developers/guides/advanced/how-to-request-optimal-compute) for more information on compute units.

## node.js specific helpers

### Get a keypair from a keypair file

Usage:

```typescript
getKeypairFromFile(filename);
```

Gets a keypair from a file - the format must be the same as [Solana CLI](https://docs.solana.com/wallet-guide/file-system-wallet) uses, ie, a JSON array of numbers:

To load the default keypair `~/.config/solana/id.json`, just run:

```typescript
const keyPair = await getKeypairFromFile(file);
```

or to load a specific file:

```typescript
const keyPair = await getKeypairFromFile("somefile.json");
```

or using home dir expansion:

```typescript
const keyPair = await getKeypairFromFile("~/code/solana/demos/steve.json");
```

### Get a keypair from an environment variable

Usage:

```typescript
getKeypairFromEnvironment(environmentVariable);
```

Gets a keypair from a secret key stored in an environment variable. This is typically used to load secret keys from [env files](https://stackoverflow.com/questions/68267862/what-is-an-env-or-dotenv-file-exactly).

```typescript
const keypair = await getKeypairFromEnvironment("SECRET_KEY");
```

### Add a new keypair to an env file

Usage:

```typescript
addKeypairToEnvFile(keypair, environmentVariable, envFileName);
```

Saves a keypair to the environment file.

```typescript
await addKeypairToEnvFile(testKeypair, "SECRET_KEY");
```

or to specify a file name:

```typescript
await addKeypairToEnvFile(testKeypair, "SECRET_KEY", ".env.local");
```

This will also reload the env file.

### Load or create a keypair and airdrop to it if needed

Usage:

```typescript
initializeKeypair(connection, options);
```

Loads in a keypair from the filesystem, or environment and then airdrops to it if needed.

How the keypair is initialized is dependant on the `initializeKeypairOptions`:

```typescript
interface initializeKeypairOptions {
  envFileName?: string;
  envVariableName?: string;
  airdropAmount?: number;
  minimumBalance?: number;
  keypairPath?: string;
}
```

By default, the keypair will be retrieved from the `.env` file. If a `.env` file does not exist, this function will create one with a new keypair under the optional `envVariableName`.

To load the keypair from the filesystem, pass in the `keypairPath`.

After the keypair has been loaded, it will check the account's balance. If the balance is below the `minimumBalance`, it will airdrop the account `airdropAmount`.

To initialize a keypair from the `.env` file, and airdrop it 1 sol if it's beneath 0.5 sol:

```typescript
const keypair = await initializeKeypair(connection);
```

To initialize a keypair from the `.env` file under a different variable name:

```typescript
const keypair = await initializeKeypair(connection, {
  envVariableName: "TEST_KEYPAIR",
});
```

To initialize a keypair from the filesystem, and airdrop it 3 sol:

```typescript
const keypair = await initializeKeypair(connection, {
  keypairPath: "~/.config/solana/id.json",
  airdropAmount: LAMPORTS_PER_SOL * 3,
});
```

The default options are as follows:

```typescript
const DEFAULT_AIRDROP_AMOUNT = 1 * LAMPORTS_PER_SOL;
const DEFAULT_MINIMUM_BALANCE = 0.5 * LAMPORTS_PER_SOL;
const DEFAULT_ENV_KEYPAIR_VARIABLE_NAME = "PRIVATE_KEY";
```

## Secret key format

Secret keys can be read in either the more compact base58 format (`base58.encode(randomKeypair.secretKey);`), like:

```bash
# A random secret key for demo purposes
SECRET_KEY=QqKYBnj5mcgUsS4vrCeyMczbTyV1SMrr7SjSAPj7JGFtxfrgD8AWU8NciwHNCbmkscbvj4HdeEen42GDBSHCj1N
```

Or the longer, 'array of numbers' format `JSON.stringify(Object.values(randomKeypair.secretKey));`:

```bash
# A random secret key for demo purposes
SECRET_KEY=[112,222,91,246,55,109,221,4,23,148,251,127,212,180,44,249,182,139,18,13,209,208,6,7,193,210,186,249,148,237,237,1,70,118,1,153,238,134,239,75,187,96,101,138,147,130,181,71,22,82,44,217,194,122,59,208,134,119,98,53,136,108,44,105]
```

We always save keys using the 'array of numbers' format, since most other Solana apps (like the CLI SDK and Rust tools) use the 'array of numbers' format.

## Development

To run tests, open a terminal tab, and run:

```bash
solana-test-validator
```

Then in a different tab, run:

```bash
npm run test
```

The tests use the [node native test runner](https://blog.logrocket.com/exploring-node-js-native-test-runner/).

If you'd like to run a single test, use:

```bash
esrun --node-test-name-pattern="getCustomErrorMessage" src/index.test.ts
```

To just run tests matching the name `getCustomErrorMessage`.
