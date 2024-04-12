# 🛹 Welcome to our Laboratory

<br>

### Demos

<br>

#### ➡️ [Backend demos](backend)

#### ➡️ [Frontend demos](frontend)

#### ➡️ [Neodyme's recommended layout](neodyme_layout)

<br>

---

### Troubleshooting

<br>

#### `package solana-program v1.z cannot be built because it requires rustc 1.x or newer, while the currently active rustc version is 1.y-dev`

<br>

* Run:

```shell
solana-install update
```

* If that doesn't work, downgrade the target version of `solana-program` in `Cargo.toml` to what is shown by this command:
```shell
cargo-build-sbf --version
```
  
