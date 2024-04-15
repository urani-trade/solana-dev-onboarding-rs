# 🛹 SPL Tokens

<br>

### tl; dr

<br>

* SPL tokens are all non-native tokens on the Solana blockchain (fungible or non-fungible).

* The **Token Program** has instructions for creating and interacting with SPL tokens:
    * **Token Mints** are accounts holding data about a specific token (but not the tokens).
    * **Token Accounts** are used to hold tokens of a particular token mint.
    * They both require allocating rent in SOL.


<br>

---

### Getting started with  `spl-token-cli`

<br>

* Install with:

<br>

```shell
cargo install spl-token-cli
```

<br>

* Alternatively, you could use the [JavaScript's library spl-token](https://www.npmjs.com/package/@solana/spl-token).

<br>

---

### Creating a SPL Token

<br>

```shell
spl-token create-token
```

<br>

* The address of the token will be printed out.

<br>

---

### Getting the Token's Supply

<br>

```shell
spl-token supply <TOKEN ADDRESS>
```

<br>

* To interact with any created token, we must create an account to store the token amount in our wallet.

* If we create a token without an account, the above command will return `0`.

<br>

----

### Creating an Account

<br>

* A **Token Account** holds tokens of a specific mint and owner:

<br>


```shell
spl-token create-account <TOKEN ADDRESS>
```

<br>

* This command will print the address of the account created for the token, representing the wallet (account) holding the tokens in your wallet.

<br>

* If using JavaScript's `@solana/spl-token`:

<br>

```javascript
const tokenAccount = await createAccount(
  connection,
  payer,
  mint,
  owner,
  keypair
);
```

---

### Checking the Balance of an Account

<br>

```shell
spl-token balance <TOKEN ADDRESS>
```

<br>

* This command will print `0` if you haven't minted any tokens to that wallet.

<br>

---

### Minting Tokens

<br>

* Minting tokens is the process of issuing new tokens into circulation (by increasing the supply of the token and depositing the newly minted tokens into a token account).

* A **Token Mint** is the account that holds data about a specific token:

<br>

```shell
spl-token mint <TOKEN ADDRESS> <NUMBER OF TOKENS TO BE MINTED>
```

<br>

* If using JavaScript's `@solana/spl-token`, this would create a new account and initialize a new mint together:

<br>

```javascript
const tokenMint = await createMint(
  connection,
  payer,
  mintAuthority,
  freezeAuthority,
  decimal
);
```


<br>

---

### Transfering Tokens

<br>

* Token transfers require both the sender and receiver to have token accounts for the mint of the tokens being transferred:

<br>

```shell
spl-token transfer <TOKEN ADDRESS> <NUMBER OF TOKENS TO BE MINTED> <RECIPIENT ADDRESS>
```


<br>

* If using JavaScript's `@solana/spl-token`:

<br>

```javascript
const transactionSignature = await transfer(
  connection,
  payer,
  source,
  destination,
  owner,
  amount
)
```

<br>

* If the recipient is new (has no account), you can add `--fund-recipient`, as it's a requirement to deposit enough SOL for rent exemption when initializing a new account (`getMinimumBalanceForRentExemptMint` on `@solana/spl-token`)


<br>

---

### Approving or Revoking Delegate

<br>

* The process of authorizing another account to transfer or burn tokens from a token account.
    - The authority over the token account remains with the original owner. 
    - The maximum amount of tokens a delegate may transfer or burn is specified at the time the owner of the token account approves the delegate. 


<br>

---

### References

<br>

* [Create Tokens With The Token Program, by soldev](https://www.soldev.app/course/token-program)
