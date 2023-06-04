import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { signIn } from "next-auth/react";
import { useAccount, useConnect, useSigner, useSignMessage, useDisconnect } from "wagmi";
import { useRouter } from "next/router";
import { useAuthRequestChallengeEvm } from "@moralisweb3/next";
import { useState } from "react";

function SignIn() {
    const { connectAsync } = useConnect();
    const { disconnectAsync } = useDisconnect();
    const { isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const { requestChallengeAsync } = useAuthRequestChallengeEvm();
    const { push } = useRouter();
    const signer = useSigner();
    const [isLoading, setIsLoading] = useState(false);

    const handleAuth = async () => {
        try {
            setIsLoading(true); // set loading state to true

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
        } finally {
            setIsLoading(false); // set loading state to false
        }
    };

    return (
        <div>
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleAuth}
                disabled={isLoading} // disable the button when it's loading
            >
                {isLoading ? (
                    <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm12 0a8 8 0 100-16 8 8 0 000 16zM4 12h4m8 0h4"
                        />
                    </svg>
                ) : (
                    "Authenticate via Metamask"
                )}
            </button>
        </div>
    );
}

export default SignIn;
