
import type { NextPage } from 'next'
import Head from 'next/head'
import { Center, Box, Heading } from '@chakra-ui/react'
import { AppBar } from '../components/AppBar'
import { MovieList } from '../components/MovieList'
import { Form } from '../components/Form'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  return (
    <div className={styles.App}>
      <Head>
        <title>Demo 5: Serizalization with PDA</title>
      </Head>
      <AppBar />
      <Center>
        <Box>
          <Heading as="h1" size="l" color="white" ml={4} mt={8}>
            Add a movie review
          </Heading>
          <Form />
          <Heading as="h1" size="l" color="white" ml={4} mt={8}>
            Existing reviews
          </Heading>
          <MovieList />
        </Box>
      </Center>
    </div>
  )
}

export default Home
