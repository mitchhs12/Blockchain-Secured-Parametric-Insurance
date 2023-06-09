import { MoralisNextApi } from "@moralisweb3/next";

const apiKey = process.env.NEXT_PUBLIC_MORALIS_API_KEY;
const nextAuthUrl = process.env.NEXTAUTH_URL;

if (!apiKey) {
    throw new Error("Please ensure you have MORALIS_API_KEY in your environment variables");
}

if (!nextAuthUrl) {
    throw new Error("Please ensure you have NEXTAUTH_URL in your environment variables");
}

export default MoralisNextApi({
    apiKey,
    authentication: {
        domain: "chainlink-secured-parametric-insurance-q34ch1jzq-mitchhs12.vercel.app",
        uri: nextAuthUrl,
        timeout: 120,
    },
});
