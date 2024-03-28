export default function onExit(cleanUp) {
    // const events = [`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`]
    for (const event of [
        `exit`,
        `SIGINT`,
        `SIGUSR1`,
        `SIGUSR2`,
        `uncaughtException`,
        `SIGTERM`,
    ]) {
        process.on(event, () => cleanUp(event));
    }
}
