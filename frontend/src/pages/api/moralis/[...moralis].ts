import { MoralisNextApi } from "@moralisweb3/next";

console.log("MORALIS_API_KEY:", process.env.MORALIS_API_KEY);
console.log("NEXT_AUTH_URL:", process.env.NEXTAUTH_URL);

export default MoralisNextApi({
    apiKey: process.env.MORALIS_API_KEY,
    authentication: {
        domain: "my.dapp",
        uri: process.env.NEXTAUTH_URL,
        timeout: 120,
    },
});
