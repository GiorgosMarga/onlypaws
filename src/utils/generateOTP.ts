export default function generateOTP() {
    return Math.floor(Math.random() * (999_999 - 100_000 + 1)) +  100_000;
}