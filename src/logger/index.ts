
export default function logError(err: Error) {
    console.log({
        name: err.name,
        message: err.message,
        timestamp: Date.now().toLocaleString(),
        stack: err.stack
    })
}