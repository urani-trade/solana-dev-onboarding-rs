# Blocto Provider

Blocto Crosschain SDK
## `Setup`
```
yarn 

# generate local https cert
brew install mkcert
mkcert -install
cd dev-cert
mkcert localhost

# make dev directory
mkdir dev
ln -s src/main.js dev/main.js
```

## `Scripts`

`build`: build dist
`start`: run live-reload dev server on `https://localhost:7777`

## `Develop`

open browser and navigate to `https://localhost:7777/test.html`
