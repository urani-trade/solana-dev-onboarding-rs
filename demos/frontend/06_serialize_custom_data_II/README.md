# 🛹 Demo 6: Serializing Custom Data with PDA II


<br>

### tl; dr

<br>


* In this demo we build a chat dApp that lets people submit their introduction and have it stored on Solana’s network. 

<br>

<p align="center">
<img src="https://github.com/urani-labs/solana-dev-onboarding-rs/assets/162904807/2b4594ac-ffee-49db-bcb0-510936a405f2" width="50%" align="center" style="padding:1px;border:1px solid black;"/>
</p>


<br>


---

### Setup

<br>

* Run `npm install --force` from the root of the project.
* Install [Phantom Wallet](https://phantom.app/).


<br>

---

### The Buffer Layout

<br>

* Many components from this demo are similar from the previous.

* However, in this example, we create the instruction buffer layout in `models/StudentIntro.ts`, and the program expects instruction data to contain:
    - `variant` as an unsigned, 8-bit integer representing the instruction to run (should be 0)
    - `name` as a string representing a name
    - `message` as a string representing the message


<br>

```javascript
import * as borsh from '@project-serum/borsh'

export class StudentIntro {
    name: string;
    message: string;

    constructor(name: string, message: string) {
        this.name = name;
        this.message = message;
    }

    static mocks: StudentIntro[] = [
        new StudentIntro('Elizabeth Holmes', `Learning Solana so I can use it to build sick NFT projects.`),
        new StudentIntro('Jack Nicholson', `I want to overhaul the world's financial system. Lower friction payments/transfer, lower fees, faster payouts, better collateralization for loans, etc.`),
        new StudentIntro('Terminator', `i'm basically here to protect`),
    ]

    borshInstructionSchema = borsh.struct([
        borsh.u8('variant'),
        borsh.str('name'),
        borsh.str('message'),
    ])

    static borshAccountSchema = borsh.struct([
        borsh.bool('initialized'),
        borsh.str('name'),
        borsh.str('message'),
    ])

    serialize(): Buffer {
        const buffer = Buffer.alloc(1000)
        this.borshInstructionSchema.encode({ ...this, variant: 0 }, buffer)
        return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer))
    }

    static deserialize(buffer?: Buffer): StudentIntro|null {
        if (!buffer) {
            return null
        }

        try {
            const { name, message } = this.borshAccountSchema.decode(buffer)
            return new StudentIntro(name, message)
        } catch(e) {
            console.log('Deserialization error:', e)
            return null
        }
    }
}
```

<br>

---

### Running

<br>

* To check the final dApp, change the settings of your Phantom wallet to "devnet" and then run:

<br>

```
npm run dev
```

<br>

* Open your browser at `localhost:3000` and submit an introduction

* Check the transaction at the [Solana Explorer](https://explorer.solana.com/?cluster=devnet).
