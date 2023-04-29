import { getSession, signOut } from "next-auth/react";
import { GetServerSidePropsContext } from "next";
import Content from "@/components/Content";
import { shortenWalletAddress } from "@/utils/helpers";

interface UserSession {
    user: {
        id: string;
        domain: string;
        chainId: number;
        address: string;
        uri: string;
        version: string;
        nonce: string;
        profileId: string;
        payload: any | null;
    };
    expires: string;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getSession(context);
    if (!session) {
        // redirect if not authenticated
        return {
            redirect: {
                destination: "/",
                permanent: true,
            },
        };
    }
    console.log(session.user);
    return { props: { session } };
}
const user_home = ({ session }: { session: UserSession }) => {
    const shortenedAddress = shortenWalletAddress(session.user.address);
    return (
        <div className="flex flex-col h-screen">
            <div className="flex justify-end items-center py-4 px-6">
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => signOut({ redirect: true })}
                >
                    Disconnect {shortenedAddress}
                </button>
            </div>
            <div className="flex-grow flex items-center justify-center mb-20">
                <Content />
            </div>
        </div>
    );
};

export default user_home;
