# 🛹 SPL Tokens

<br>

### Installing `spl-token-cli`

<br>

```shell
cargo install spl-token-cli
```

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

* If we just create a token without an account, the command above will return `0`.

* To interact with any created token, we need to create an account for it, which will store the amount of that token on our own wallet.

<br>

---

### Creating an Account

<br>

```shell
spl-token create-account <TOKEN ADDRESS>
```

<br>

* This command will print the address of the account created for the token, which represents the wallet (account) holding the tokens in your own wallet.

<br>

---

### Checking a Balance of an Account

<br>

```shell
spl-token balance <TOKEN ADDRESS>
```

<br>

* This command will prints `0` if you haven't minted any tokens to that wallet.

<br>

---

### Minting Tokens

<br>

```shell
spl-token mint <TOKEN ADDRESS> <NUMBER OF TOKENS TO BE MINTED>
```

<br>

---

### Transfering Tokens

<br>

```shell
spl-token transfer <TOKEN ADDRESS> <NUMBER OF TOKENS TO BE MINTED> <RECIPIENT ADDRESS>
```

<br>

* If the recipient is new (has no account), you can add `--fund-recipient`.