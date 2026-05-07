/** Logs only in Vite dev — avoids noisy production console output. */
export function devLog(...args: unknown[]): void {
    if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console -- intentional dev-only logging
        console.log(...args);
    }
}
