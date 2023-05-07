import { getSession } from "next-auth/react";
import { GetServerSidePropsContext } from "next";
import Content from "@/components/Content";
import Navbar from "@/components/Navbar";

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

const user_home = ({
    session,
    setBackgroundColor,
}: {
    session: UserSession;
    setBackgroundColor: (color: string) => void;
}) => {
    return (
        <div className="flex flex-col w-full h-full justify-center">
            <Navbar address={session.user.address} />
            <div className="flex flex-grow border-2 items-center w-full h-full justify-center mb-20">
                <Content setBackgroundColor={setBackgroundColor} />
            </div>
        </div>
    );
};

export default user_home;
