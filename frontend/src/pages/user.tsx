import { getSession, signOut } from "next-auth/react";
import { GetServerSidePropsContext } from "next";

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
    console.log(typeof session);
    console.log(session);

    if (!session) {
        // redirect if not authenticated
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }
    return { props: { session } };
}
const user_home = ({ session }: { session: UserSession }) => {
    return (
        <div>
            <h4>User session:</h4>
            <pre>{JSON.stringify(session.user, null, 2)}</pre>
            <button onClick={() => signOut({ redirect: true })}>Sign out</button>
        </div>
    );
};

export default user_home;
