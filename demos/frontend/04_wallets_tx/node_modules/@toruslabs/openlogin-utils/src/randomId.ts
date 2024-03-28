// TODO: should be crypto safe
import randombytes from "randombytes";

export const randomId = (): string => randombytes(32).toString("hex");
