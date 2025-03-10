export default function convertToMs(amount: number, from: "s"|"d"|"h"|"min") {
    switch(from){
        case "s":
            return amount * 1000
        case "d":
            return amount * 1000 * 60 * 60 * 24
        case "h":
            return amount * 1000 * 60 * 60
        case "min":
            return amount * 1000 * 60
        default:
            throw new Error("Invalid from")
    }
}