export default function generateOTP() {
    return Math.floor(Math.random() * (99_999 - 10_000 + 1)) +  10_000;
}