# 🛹 Demo 7: Example with `create-dapp-cli`

<br>

### 1. Creating a New Project

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


---

### 2. Syncing the program id

<br>

* Run the follow to create a new keypair inside the `./anchor/target/deploy` directory:

<br>

```shell
npm run anchor keys sync
```

<br>

---

### 3. Building the Program

<br>

```shell
npm run anchor-build
```

<br>

---

### 4. Running Tests

<br>

```shell
npm run anchor-test
```

<br>

---

### 5. Building the dApp

<br>

```shell
npm run build
```

<br>

---

### 6. Starting the dApp

<br>

```
npm run dev
```

<br>

---

### 7. Deploying the dApp

<br>

* Start the validator in another window with `solana-test-validator`, and then run:

<br>

```shell
npm run anchor deploy 
```

