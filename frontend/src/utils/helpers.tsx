// Check if a string is a valid Ethereum address and shorten it
export function shortenWalletAddress(walletAddress: string): string {
    // Define the prefix and suffix lengths to display
    const prefixLength = 6;
    const suffixLength = 4;

    // Check if the input is a valid wallet address
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        return walletAddress;
    }

    // Shorten the wallet address by taking the prefix and suffix
    const prefix = walletAddress.slice(0, prefixLength);
    const suffix = walletAddress.slice(-suffixLength);

    // Combine the prefix, ellipsis, and suffix to form the shortened address
    const ellipsis = "...";
    const shortenedAddress = prefix + ellipsis + suffix;

    return shortenedAddress;
}
