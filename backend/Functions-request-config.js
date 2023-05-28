const fs = require("fs")

// Loads environment variables from .env.enc file (if it exists)
require("@chainlink/env-enc").config()

const Location = {
  Inline: 0,
  Remote: 1,
}

const CodeLanguage = {
  JavaScript: 0,
}

const ReturnType = {
  uint: "uint256",
  uint256: "uint256",
  int: "int256",
  int256: "int256",
  string: "string",
  bytes: "Buffer",
  Buffer: "Buffer",
}

// Configure the request by setting the fields below
const requestConfig = {
  // location of source code (only Inline is curently supported)
  codeLocation: Location.Inline,
  // code language (only JavaScript is currently supported)
  codeLanguage: CodeLanguage.JavaScript,
  // string containing the source code to be executed
  source: fs.readFileSync("./Functions-request-source.js").toString(),
  // secrets can be accessed within the source code with `secrets.varName` (ie: secrets.apiKey)
  //secrets: { apiKey: process.env.COINMARKETCAP_API_KEY },
  // ETH wallet key used to sign secrets so they cannot be accessed by a 3rd party
  walletPrivateKey: process.env["PRIVATE_KEY"],
  // args can be accessed within the source code with `args[index]` (ie: args[0])
  args: [
    "51.508010018522505",
    "-0.11932593407738779",
    "51.49700386692128",
    "-0.11932593407738779",
    "51.49700386692128",
    "-0.14112692895043466",
    "51.508010018522505",
    "-0.14112692895043466",
    "15",
    "1685312407",
    "1686435564",
    "1687299564",
  ],
  // expected type of the returned value
  expectedReturnType: ReturnType.uint256,
}

module.exports = requestConfig
