# 🛹 Demo 5: Serializing Custom Data with PDA I


<br>

### tl; dr

<br>


* In this demo we build a Movie Review dApp that lets users submit a movie review and have it stored on Solana’s network. 

<br>

---

### Setup

<br>

* Run `npm install` from the root of the project.
* Install [Phantom Wallet](https://phantom.app/).


<br>

---

### The Buffer Layout

<br>

* The Movie Review program is expecting instruction data to contain:
    - `variant` as an unsigned, 8-bit integer representing which instruction should be executed
    - `title` as a string representing the title of the movie that you are reviewing
    - `rating` as an unsigned, 8-bit integer representing the rating out of 5 that you are giving to the movie you are reviewing
    - `description` as a string representing the written portion of the review you are leaving for the movie

* To configure a borsh layout in the Movie class, we create a `borshInstructionSchema` property and set it to the appropriate borsh struct containing the properties listed above.


<br>

```javascript
import * as borsh from '@coral-xyz/borsh'

export class Movie {
  title: string;
  rating: number;
  description: string;

  ...

  borshInstructionSchema = borsh.struct([
    borsh.u8('variant'),
    borsh.str('title'),
    borsh.u8('rating'),
    borsh.str('description'),
  ])
}
```

<br>

---

### The `serialize()` method

<br>

* We create a method that returns a `Buffer` with a `Movie` object’s properties encoded into the appropriate layout, under `models/Movie.ts`:

<br>

```javascript
import * as borsh from '@project-serum/borsh'

export class Movie {
    title: string;
    rating: number;
    description: string;

    constructor(title: string, rating: number, description: string) {
        this.title = title;
        this.rating = rating;
        this.description = description;
    }

    static mocks: Movie[] = [
        new Movie('The Shawshank Redemption', 5, `For a movie shot entirely in prison where there is no hope at all, shawshank redemption's main massage and purpose is to remind us of hope, that even in the darkest places hope exists, and only needs someone to find it. Combine this message with a brilliant screenplay, lovely characters and Martin freeman, and you get a movie that can teach you a lesson everytime you watch it. An all time Classic!!!`),
        new Movie('The Godfather', 5, `One of Hollywood's greatest critical and commercial successes, The Godfather gets everything right; not only did the movie transcend expectations, it established new benchmarks for American cinema.`),
        new Movie('The Godfather: Part II', 4, `The Godfather: Part II is a continuation of the saga of the late Italian-American crime boss, Francis Ford Coppola, and his son, Vito Corleone. The story follows the continuing saga of the Corleone family as they attempt to successfully start a new life for themselves after years of crime and corruption.`),
        new Movie('The Dark Knight', 5, `The Dark Knight is a 2008 superhero film directed, produced, and co-written by Christopher Nolan. Batman, in his darkest hour, faces his greatest challenge yet: he must become the symbol of the opposite of the Batmanian order, the League of Shadows.`),
    ]

    borshInstructionSchema = borsh.struct([
        borsh.u8('variant'),
        borsh.str('title'),
        borsh.u8('rating'),
        borsh.str('description'),
    ])

    static borshAccountSchema = borsh.struct([
        borsh.bool('initialized'),
        borsh.u8('rating'),
        borsh.str('title'),
        borsh.str('description'),
    ])

    serialize(): Buffer {
        const buffer = Buffer.alloc(1000)
        this.borshInstructionSchema.encode({ ...this, variant: 0 }, buffer)
        return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer))
    }

    static deserialize(buffer?: Buffer): Movie | null {
        if (!buffer) {
            return null
        }

        try {
            const { title, rating, description } = this.borshAccountSchema.decode(buffer)
            return new Movie(title, rating, description)
        } catch (e) {
            console.log('Deserialization error:', e)
            console.log(buffer)
            return null
        }
    }
}
```

<br>

----

### Sending Transactions

<br>

* We create and send the transaction when a user submits the form, under `components/Form.tsx`:

<br>

```javascript
import { FC } from 'react'
import { Movie } from '../models/Movie'
import { useState } from 'react'
import { Box, Button, FormControl, FormLabel, Input, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Textarea } from '@chakra-ui/react'
import * as web3 from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'

const MOVIE_REVIEW_PROGRAM_ID = 'CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN'

export const Form: FC = () => {
    const [title, setTitle] = useState('')
    const [rating, setRating] = useState(0)
    const [description, setDescription] = useState('')

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const handleSubmit = (event: any) => {
        event.preventDefault()
        const movie = new Movie(title, rating, description)
        handleTransactionSubmit(movie)
    }

    const handleTransactionSubmit = async (movie: Movie) => {
        if (!publicKey) {
            alert('Please connect your wallet!')
            return
        }

        const buffer = movie.serialize()
        const transaction = new web3.Transaction()

        const [pda] = await web3.PublicKey.findProgramAddress(
            [publicKey.toBuffer(), Buffer.from(movie.title)],// new TextEncoder().encode(movie.title)],
            new web3.PublicKey(MOVIE_REVIEW_PROGRAM_ID)
        )

        const instruction = new web3.TransactionInstruction({
            keys: [
                {
                    pubkey: publicKey,
                    isSigner: true,
                    isWritable: false,
                },
                {
                    pubkey: pda,
                    isSigner: false,
                    isWritable: true
                },
                {
                    pubkey: web3.SystemProgram.programId,
                    isSigner: false,
                    isWritable: false
                }
            ],
            data: buffer,
            programId: new web3.PublicKey(MOVIE_REVIEW_PROGRAM_ID)
        })

        transaction.add(instruction)

        try {
            let txid = await sendTransaction(transaction, connection)
            alert(`Transaction submitted: https://explorer.solana.com/tx/${txid}?cluster=devnet`)
            console.log(`Transaction submitted: https://explorer.solana.com/tx/${txid}?cluster=devnet`)
        } catch (e) {
            console.log(JSON.stringify(e))
            alert(JSON.stringify(e))
        }
    }

    return (
        <Box
            p={4}
            display={{ md: "flex" }}
            maxWidth="32rem"
            borderWidth={1}
            margin={2}
            justifyContent="center"
        >
            <form onSubmit={handleSubmit}>
                <FormControl isRequired>
                    <FormLabel color='gray.200'>
                        Movie Title
                        </FormLabel>
                    <Input 
                    id='title' 
                    color='gray.400'
                    onChange={event => setTitle(event.currentTarget.value)}
                />
                </FormControl>
                <FormControl isRequired>
                    <FormLabel color='gray.200'>
                        Add your review
                        </FormLabel>
                    <Textarea 
                        id='review' 
                        color='gray.400'
                        onChange={event => setDescription(event.currentTarget.value)}
                    />
                </FormControl>
                <FormControl isRequired>
                    <FormLabel color='gray.200'>
                        Rating
                        </FormLabel>
                    <NumberInput 
                        max={5} 
                        min={1} 
                        onChange={(valueString) => setRating(parseInt(valueString))}
                    >
                        <NumberInputField id='amount' color='gray.400' />
                        <NumberInputStepper color='gray.400'>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                </FormControl>
                <Button width="full" mt={4} type="submit">
                    Submit Review
                </Button>
            </form>
        </Box>
    );
}
```

<br>

---

### The Movie Coordinator

<br>

* Under `coordinators/MovieCoordinator.ts`:

<br>

```javascript
import bs58 from 'bs58'
import * as web3 from '@solana/web3.js'
import { Movie } from '../models/Movie'

const MOVIE_REVIEW_PROGRAM_ID = 'CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN'

export class MovieCoordinator {
    static accounts: web3.PublicKey[] = []

    static async prefetchAccounts(connection: web3.Connection, search: string) {
        const accounts = await connection.getProgramAccounts(
            new web3.PublicKey(MOVIE_REVIEW_PROGRAM_ID),
            {
                dataSlice: { offset: 2, length: 18 },
                filters: search === '' ? [] : [
                    { 
                        memcmp: 
                            { 
                                offset: 6, 
                                bytes: bs58.encode(Buffer.from(search))
                            }
                    }
                ]
            }
        )

        accounts.sort( (a, b) => {
            const lengthA = a.account.data.readUInt32LE(0)
            const lengthB = b.account.data.readUInt32LE(0)
            const dataA = a.account.data.slice(4, 4 + lengthA)
            const dataB = b.account.data.slice(4, 4 + lengthB)
            return dataA.compare(dataB)
        })

        this.accounts = accounts.map(account => account.pubkey)
    }

    static async fetchPage(connection: web3.Connection, page: number, perPage: number, search: string, reload: boolean = false): Promise<Movie[]> {
        if (this.accounts.length === 0 || reload) {
            await this.prefetchAccounts(connection, search)
        }

        const paginatedPublicKeys = this.accounts.slice(
            (page - 1) * perPage,
            page * perPage,
        )

        if (paginatedPublicKeys.length === 0) {
            return []
        }

        const accounts = await connection.getMultipleAccountsInfo(paginatedPublicKeys)

        const movies = accounts.reduce((accum: Movie[], account) => {
            const movie = Movie.deserialize(account?.data)
            if (!movie) {
                return accum
            }

            return [...accum, movie]
        }, [])

        return movies
    }
}
```


<br>

---


### Components for Cards and MovieList

<br>

* Finally, we add the component to create the movie cards, under `components/Cards.tsx`:

<br>

```javascript
import { Box, HStack, Spacer, Stack, Text } from '@chakra-ui/react';
import { FC } from 'react';
import { Movie } from '../models/Movie';

export interface CardProps {
    movie: Movie;
}

export const Card: FC<CardProps> = (props) => {
    return (
        <Box
            p={4}
            display={{ md: "flex" }}
            maxWidth="32rem"
            borderWidth={1}
            margin={2}
        >
            <Stack
                w='full'
                align={{ base: "center", md: "stretch" }}
                textAlign={{ base: "center", md: "left" }}
                mt={{ base: 4, md: 0 }}
                ml={{ md: 6 }}
                mr={{ md: 6 }}
            >
                <HStack >
                    <Text
                        fontWeight="bold"
                        textTransform="uppercase"
                        fontSize="lg"
                        letterSpacing="wide"
                        color="gray.200"
                    >
                        {props.movie.title}
                    </Text>
                    <Spacer />
                    <Text
                        color="gray.200"
                    >
                        {props.movie.rating}/5
                    </Text>
                </HStack>
                <Text my={2} color="gray.400">
                    {props.movie.description}
                </Text>
            </Stack>
        </Box>
    )
}
```

<br>

* And the movie list:

<br>

```javascript
import { Card } from './Card'
import { FC, useEffect, useState } from 'react'
import { Movie } from '../models/Movie'
import * as web3 from '@solana/web3.js'

const MOVIE_REVIEW_PROGRAM_ID = 'CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN'

export const MovieList: FC = () => {
    const connection = new web3.Connection(web3.clusterApiUrl('devnet'))
    const [movies, setMovies] = useState<Movie[]>([])

    useEffect(() => {
        connection.getProgramAccounts(new web3.PublicKey(MOVIE_REVIEW_PROGRAM_ID)).then(async (accounts) => {
            const movies: Movie[] = accounts.reduce((accum: Movie[], { pubkey, account }) => {
                const movie = Movie.deserialize(account.data)
                if (!movie) {
                    return accum
                }

                return [...accum, movie]
            }, [])
            setMovies(movies)
        })
    }, [])
    
    return (
        <div>
            {
                movies.map((movie, i) => <Card key={i} movie={movie} /> )
            }
        </div>
    )
}
```


<br>

---


### Running

<br>

* To check the final dppp, change the settings of your Phantom wallet to "devnet" and then run:

<br>

```
npm install
npm run dev
```

<br>

* Open your browser at `localhost:3000` and submit a movie review.

* Check the transaction at the [Solana Explorer](https://explorer.solana.com/?cluster=devnet).