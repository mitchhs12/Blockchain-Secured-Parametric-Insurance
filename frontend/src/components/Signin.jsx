import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { signIn } from "next-auth/react";
import { useAccount, useConnect, useSignMessage, useDisconnect } from "wagmi";
import { useRouter } from "next/router";
import { useAuthRequestChallengeEvm } from "@moralisweb3/next";

function SignIn() {
    const { connectAsync } = useConnect();
    const { disconnectAsync } = useDisconnect();
    const { isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const { requestChallengeAsync } = useAuthRequestChallengeEvm();
    const { push } = useRouter();

    const handleAuth = async () => {
        try {
            if (isConnected) {
                await disconnectAsync();
            }

            const { account, chain } = await connectAsync({
                connector: new MetaMaskConnector(),
            });

            const { message } = await requestChallengeAsync({
                address: account,
                chainId: chain.id,
            });

            const signature = await signMessageAsync({ message });

            // redirect user after success authentication to '/user' page
            const { url } = await signIn("moralis-auth", {
                message,
                signature,
                redirect: false,
                callbackUrl: "/user",
            });

            // instead of using signIn(..., redirect: "/user")
            // we get the url from callback and push it to the router to avoid page refreshing
            push(url);
        } catch (error) {
            console.error(error);
            // handle the error here, e.g. show a message to the user
        }
    };

    return (
        <div>
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleAuth}
            >
                Authenticate via Metamask
            </button>
        </div>
    );
}

export default SignIn;
