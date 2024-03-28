# 🛹 Demo 7: Example with `create-dapp-cli`

<br>

### Creating a New Project

<br>

* A new project can be generated with:

<br>


```
npx create-solana-dapp@latest
```

<br>

* Install dependencies:

<br>

```shell
npm install
```

<br>

* Start the Next.js app with:

<br>

```
npm run dev
```


<br>


---

### Starting the Web App

<br>

```
npm run dev
```

<br>

---

### Syncing the program id

<br>

* Run the follow to create a new keypair in the `anchor/target/deploy` directory:

<br>

```shell
npm run anchor keys sync
```

<br> 

* Then save the address to the Anchor config file and update the `declare_id!` macro in the `./src/lib.rs` file of the program.

<br>

* Finally, update the constant in `anchor/lib/counter-exports.ts` to match the new program id.

<br>

---

### Building the Program:

<br>

```shell
npm run anchor-build
```

<br>

---

### Staring the Test Validator 

<br>

```shell
npm run anchor-localnet
```

<br>

---

### Running Tests

<br>

```shell
npm run anchor-test
```

<br>

---

### Deploying to Devnet

<br>

```shell
npm run anchor deploy --provider.cluster devnet
```

<br>

---

### Starting the Web App

<br>

```shell
npm run dev
```


<br>

---


### Building the web app

<br>

```shell
npm run build
```
