import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";


const keypair = getKeypairFromEnvironment("PRIVATE_KEY");
console.log(`The public key is: `, keypair.publicKey.toBase58());
console.log(`The private key is: `, keypair.secretKey);
