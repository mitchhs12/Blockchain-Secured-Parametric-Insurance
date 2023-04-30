import { signOut } from "next-auth/react";
import { shortenWalletAddress } from "@/utils/helpers";

const Navbar = ({ address }) => {
    const shortenedAddress = shortenWalletAddress(address);
    return (
        <nav className="flex justify-end items-center py-4 px-6">
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => signOut({ redirect: true })}
            >
                Disconnect {shortenedAddress}
            </button>
        </nav>
    );
};

export default Navbar;
