import Head from "next/head";
import SignIn from "@/components/Signin";

const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <Head>
                <title>Parametric Insurance</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
                <h1 className="text-5xl font-bold text-white">
                    Welcome to Chainlink-Secured Parametric Rainfall Insurance
                </h1>

                <p className="mt-3 text-2xl text-white">
                    This app is currently only available on the Polygon Mumbai testnet.
                </p>
                <div className="mt-6">
                    <SignIn />
                </div>
            </main>

            <footer className="flex items-center justify-center w-full h-24 border-t">
                <p className="text-gray-500">
                    Made by{" "}
                    <a
                        className="text-blue-600 hover:text-blue-800"
                        href="https://github.com/valodax"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Mitchell Spencer
                    </a>
                </p>
            </footer>
        </div>
    );
};

export default Home;
