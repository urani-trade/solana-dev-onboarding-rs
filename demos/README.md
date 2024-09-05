# 🛹 Welcome to our Laboratory

<br>

### Demos

<br>

#### 👉🏼 [Backend demos](backend)

#### 👉🏼 [Frontend demos](frontend)

#### 👉🏼 [Neodyme's layout](neodyme_layout)

<br>

---

### Troubleshooting

<br>

#### ❌ Error: `package solana-program v1.z cannot be built because it requires rustc 1.x or newer, while the currently active rustc version is 1.y-dev`

<br>

* Run:

```shell
solana-install update
```

* If that doesn't work, explicilty define solana-program's version in your project
```shell
cargo update -p solana-program --precise $(solana --version | awk '{print $2}')
```
  
