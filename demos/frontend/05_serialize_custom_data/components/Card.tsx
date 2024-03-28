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

