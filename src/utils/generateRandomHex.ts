export default function generateRandomHex(len:number=16)  {
    const a = [...crypto.getRandomValues(new Uint8Array(len))].map(m=>('0'+m.toString(16)).slice(-2)).join('');
    return a
}