import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { createClient, configureChains, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { SessionProvider } from "next-auth/react";
import { mainnet } from "wagmi/chains";
import Background from "@/components/ParticlesBackground";

const { provider, webSocketProvider } = configureChains([mainnet], [publicProvider()]);

const client = createClient({
    provider,
    webSocketProvider,
    autoConnect: true,
});

function MyApp({ Component, pageProps, router }: AppProps) {
    return (
        <WagmiConfig client={client}>
            <SessionProvider session={pageProps.session} refetchInterval={0}>
                <Background />
                <Component {...pageProps} />
            </SessionProvider>
        </WagmiConfig>
    );
}

export default function App({ Component, pageProps, router }: AppProps) {
    return <MyApp Component={Component} pageProps={pageProps} router={router} />;
}
