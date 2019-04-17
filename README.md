

# FormSI060719 Documentation

????????LEAVE OUT FUNCTIONS?
?????? SPELL CHECK

This documents explains how to use FormSI060719, which is part of the show "Garage Politburo" at Susan Inglett Gallery, NY from June 7, 2019 - July 26, 2019. As part of my first attempt at creating a tabletop bureaucracy, the instructions below are somewhat dry and unenlightening, and the interface for using the program is rather stripped down. Please submit any suggestions or complaints through the comment section.

FormSI060719 is a solidity program on the ethereum mainnet at address 0x6B9d46a223fFa343f8b14D855A8314B0EfF7fcb7. It is a form with 13 question, any of which can be answered by any user. The questions and answers that are submitted are state variables (stored on the blockchain), and behave as non-fungible tokens (see [the ERC721 standard](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md) for more information). The code is published in this repository, and at etherscan.io

The ERC721 portion of the program is based on code by [OpenZeppelin](https://github.com/OpenZeppelin/openzeppelin-solidity/tree/master/contracts/token/ERC721). 

The market portion of the program is based on [CryptoPunks](https://github.com/larvalabs/cryptopunks) by Larva Labs. 

Text snippets in FormSI060719 are taken from Masha Gessen, Nisi Shawl, Margaret Thatcher, Fredric Jameson, Leni Zumas, Philip Roth, Omar El Akkad, Wayne La Pierre, David Graeber, Walt Whitman, George Orwell, Rudyard Kipling, and Donna Haraway.

The program has been extensively tested with the help of [Truffle](https://github.com/trufflesuite/truffle). See the test folder for the testing script used.

There are three types of functions in FormSi060719: form functions (for reading and answering form questions), market functions (for bidding on question and answers, or putting them up for sale), and standard ERC721 functions.

## Form Functions

- `getFormQuestion(uint256 questionId)`

Returns text of one of the 13 form questions, identified by `questionId`, which varies between 0 and 12. For example, going to https://etherscan.io/address/0x6b9d46a223ffa343f8b14d855a8314b0eff7fcb7#readContract, and calling `getFormQuestion(0)` returns

> `FormSI060719 :: freeAssociationAndResponse :: Section 0-2b :: When we ask ourselves "How are we?
" :: we really want to know ::` 

Calling `getFormQuestions(7)` returns

> `FormSI060719 :: freeAssociationAndResponse :: Section2-TINA :: The Secret Joys of Bureaucracy :: Ministry of Splendid Suns :: Ministry of Plenty :: Crime Bureau :: Aerial Board of Control :: Office of Tabletop Assumption :: Central Committee :: Division of Complicity :: Ministry of Information :: `

and so on....

- `answerQuestion(uint256 questionId, string answer)`

Allows user to answer a question, identified by `questionId`. The string `answer` will be associated with this question, and stored on the blockchain. Like all the questions, each entered answer behaves as an ERC721 non-fungible token.

- `getNumberOfAnswers(uint256 questionId)`

Returns number of answers that have been entered for question `questionId`.

- `getFormAnswers(uint256 questionId, uint256 answerId)`

Returns text of an answer to a question. The question is identified by `questionId` (which goes from 0 to 12), and the answer for the question is identified by `answerId` (which goes from 1 to the number of answers for that particular question). If there are no answers to the question, this function throws.

- `getIndexfromQA(uint256 questionId, uint256 textId)`
- `getQAfromIndex(uint256 tokenId)`

Provides conversion between indices. The section of FormSI060719 that deals with questions and answers uses a QA index pair (`questionId, textId`) to refer to question and answer text. However, the ERC721 section of the program (see below) refers to a question or answer with a single token index (`tokenId`). The token indices 0 through 12 contain the questions, the first entered answer will receive token index 13, the second question entered will receive token index 14, etc...  The function `getIndexfromQA(uint256 questionId, uint256 textId)` takes in a QA index pair, and returns the ERC721 token index. The function `getQAfromIndex(uint256 tokenId)` takes in the ERC721 token index, and returns a QA index pair. If any of the indices are out of bounds (using 14 for `questionId`, for example), the function throws. 

A detail: in the QA index pair (`questionId, textId`), the index `questionId` identifies the question and varies from 0 to 12. When the index `textId` is zero, the question itself is selected. When the index `textId` is greater than zero, it selects an answer associated with `questionId`. 

## Market Functions

There are three groups of functions here. The "For Sale" functions enable the token owner to put a token (really a question or answer) up for sale at a price (`minPriceWei`). If someone chooses to buy the token, the token and ether change hands. Information about whether a token is up for sale, and if so what its price is, can be obtained from `marketForSaleInfoByIndex(uint256 tokenId)`. 

The "Bid" functions enable anyone to put a bid up for any token. The token owner may choose to accept the bid, resulting in an exchange of the token for the amount of ether bid. Information about whether or not there's a bid on a token, and if so what the bid amount is, can be obtained from `marketBidInfoByIndex(uint256 tokenId)`.

The "Withdraw" functions handle the withdrawal of ether after a transaction. All money amounts are in wei (1 wei = 1e18 ether)

Only the token owner (and not other authorized users from the ERC721 section of the code) can put a token up for sale, or accept a bid.

#### For Sale Functions

- `marketDeclareForSale(uint256 tokenId, uint256 minPriceInWei)`

Declare a token (identified by the ERC721 index `tokenId`) for sale, at a price `minPriceInWei`. Only the token owner can call this function.

- `marketDeclareForSaleToAddress(uint256 tokenId, uint256 minPriceInWei, address to)`

Declare a token (identified by the ERC721 index `tokenId`) for sale to a specific address `to`, at a price `minPriceInWei`. Only the address `to` can buy this token. Only the token owner can call this function.

- `marketWithdrawForSale(uint256 tokenId)`

Remove a "For Sale" declaration. Only the token owner can call this function.

- `marketForSaleInfoByIndex(uint256 tokenId)`

Shows the "For Sale" status of a specific token (identified by the ERC721 index `tokenId`). The structure `marketForSaleInfoByIndex(tokenId)` contains a boolean indicating whether or not the token is for sale (`isForSale`), the ERC721 index of the token (`tokenId`), the current owner and seller of the token (`seller`), the price of the token (`minValue`) in Wei, and the address of the recipient (`onlySellTo`). If the recipient address is the zero address, then anyone can buy the token. Note that this function is a getter that directly accesses the structure, so it does not throw if the token `tokenId` does not exist, unlike the other "For Sale" functions.

- `marketBuyForSale(uint256 tokenId)`

Enables a user to buy a token (identified by the ERC721 index `tokenId`) that is up for sale. If `marketForSaleInfoByIndex(tokenId).onlySellto` returns the zero address, then any user can buy the token that is for sale. If `marketForSaleInfoByIndex(tokenId).onlySellto` returns a non-zero address, then only that user can buy the token that is for sale. The purchaser must send an amount of wei at least equal to the sale price  (`marketForSaleInfoByIndex(tokenId).minValue`) with the function call to complete the transaction.

#### Bid Functions

- `marketDeclareBid(uint256 tokenId)`

Enables a user to declare a bid for a token (identified by the ERC721 index `tokenId`). The user must send the amount of the bid with the function call. If there is already a bid on the token (check `marketBidInfoByIndex(uint256 tokenId)`), the bid must be larger than `marketBidInfoByIndex(tokenId).value`, otherwise `marketDeclareBid(tokenId)` throws. Assuming it is larger, the previous bid is overwritten, and the amount of the previous bid is made available for withdraw through `marketWithdrawWei()`.

- `marketWithdrawBid(uint256 tokenId)`

Enables a user to remove a bid on a token (identified by the ERC721 index `tokenId`) already made. Only the bidder `marketBidInfoByIndex(tokenId).bidder` can call this function. The bid is NOT automatically refunded: the user must call `marketWithdrawWei()`.

- `marketAcceptBid(uint256 tokenId, uint256 minPrice)`

Enables a token owner to accept a bid, and transfer the token (identified by the ERC721 index `tokenId`) to the bidder in exchange for the ether bid. Only the token owner can call this function. The parameter `minPrice` must be smaller than or equal to `marketBidInfoByIndex(tokenId).value`. After calling this function, the bid is NOT automatically transferred to the former owner: the former owner must call `marketWithdrawWei()`.

- `marketBidInfoByIndex(uint256 tokenId)`

Shows the "Bid" status of a specific token (identified by the ERC721 index `tokenId`). The structure `marketBidInfoByIndex(tokenId)` contains a boolean indicating whether or not a bid for the token exists (`hasBid`), the ERC721 index of the token (`tokenId`), the current bidder for the token (`bidder`), and the bid in wei (`value`). Note that this function is a getter that directly access the structure, so it does not throw if the token `tokenId` does not exist, unlike the other "Bid" functions.

#### Withdraw Functions

- `marketPendingWithdrawals(address holder)`

Shows the amount of ether (in wei) avaiable for the address `holder` to withdraw using `marketWithdrawWei()`.

- `marketWithdrawWei()`

Enables a user to withdraw ether after a successful sale, after accepting a bid, after withdrawing a bid, or after another address outbids. When a user (identified by `address`) calls `marketWithdrawWei()`, the amount `marketPendingWithdrawals(address)` is transferred to the user address.


## ERC721 Functions

The standard ERC721 functions are implemented with [OpenZeppelin code](https://github.com/OpenZeppelin/openzeppelin-solidity/tree/master/contracts/token/ERC721) (specifically, FormSI060719 uses the Jan 4 2019 Open Zeppelin package 76abd1a41ec7d96ef76370f3eadfe097226896a2). The Open Zeppelin code is untouched, except for changes to the function `transferFrom(address from, address to, uint256 tokenId)`, which ensures that, if necessary, the function correctly resets any outstanding bids or for sale declarations when a token is transferred. 

```
name()
totalSupply()
symbol()
balanceOf(address owner)
ownerOf(uint256 tokenId)
approve(address to, uint256 tokenId)
setApprovalForAll(address to, bool approved)
isApprovedForAll(address owner, address operator)
transferFrom(address from, address to, uint256 tokenId)
safeTransferFrom(address from, address to, uint256 tokenId)
safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data)
```



