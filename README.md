

# FormSI060719

Information and code relating to FormSI060719, which is part of the show "Garage Politburo" at Susan Inglett Gallery, NY from June 7, 2019 - July 26, 2019

Based on code by OpenZeppelin: https://github.com/OpenZeppelin/openzeppelin-solidity/tree/master/contracts/token/ERC721. Code uses Jan 4 2019 Open Zepplin package 76abd1a41ec7d96ef76370f3eadfe097226896a2.

Based also on CryptoPunks by Larva Labs: https://github.com/larvalabs/cryptopunks

Text snippets in FormSI060719 are taken from Masha Gessen, Nisi Shawl, Margaret Thatcher, Fredric Jameson, Paul Preciado, Leni Zumas, Philip Roth, Omar El Akkad, Wayne La Pierre, David Graeber, Walt Whitman, George Orwell, Rudyard Kipling, and Donna Haraway.


FormSI060719 is a solidity program on the ethereum mainnet at address 0x6B9d46a223fFa343f8b14D855A8314B0EfF7fcb7. It is a form with 13 question, and a user can answer any question(s) the individual wants. The questions and answers are state variables (stored on the blockchain), and behave as [ERC721 tokens](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md). The program has been extensively tested through Truffle. See the test folder for the testing script used.

There three types of functions: form functions (for reading and answering form questions), market functions (for bidding on tokens, or putting them up for sale), and standard ERC721 functions.

## Form Functions

`getFormQuestion(uint256 questionId)`

Returns text of one of the 13 form questions, identified by `questionId`, which varies between 0 and 12 (NOT 1 to 13).

 `answerQuestion(uint256 questionId, string answer)`

Allows user to answer a question, identified by `questionId`. The string `answer` will be associated with this question, and stored on the blockchain. Like all the questions, each answer behaves as an ERC721 non-fungible token.

`getNumberOfAnswers(uint256 questionId)`

Returns number of answers that have been entered for question `questionId`.

`getFormAnswers(uint256 questionId, uint256 answerId)`

Returns text of an answer to a question. The question is identified by `questionId` (which goes from 0 to 12), and the answer for the question is identified by `answerId` (which goes from 1 to the number of answers for that particular question). If there are no answers to the question, this function throws.

```
getIndexfromQA(uint256 questionId, uint256 textId)
getQAfromIndex(uint256 tokenId)
```
Provides indices for question and answer text. Each has an ERC721 token index (`tokenId`), which starts at zero, and goes high enough to accommodate all questions and answers. Each also has a QA index pair (`questionId, textId`). The index `questionId` identifies the question and varies from 0 to 12. When the index `textId` is zero, the question itself is selected. When the index `textId` is greater than zero, it selects an answer associated with `questionId`. The function `getIndexfromQA(uint256 questionId, uint256 textId)` takes in a QA index pair, and returns the ERC721 token index. The function `getQAfromIndex(uint256 tokenId)` takes in the ERC721 token index, and returns a QA index pair. If any of the indices are out of bounds (using 14 for `questionId`, for example), the function reverts.

## Market Functions

There are two groups of functions here. The "For Sale" functions enable the token owner to put a token up for sale at a minimum price (`minPriceWei`), and enable anyone else to buy the token. Information about whether a token is up for sale, and if so what its price is, can be obtained from `marketForSaleInfoByIndex(uint256 tokenId)`. The "Bid" functions enable anyone to put a bid up for any token. The token owner may choose to accept the bid, resulting in an exchange of the token for the amount of ether bid. Information about whether or not there's a bid on a token, and if so what the bid amount is, can be obtained from `marketBidInfoByIndex(uint256 tokenId)`.

All money amounts are in wei (1 wei = 1e18 ether)

Only the token owner (and not other authorized users from the ERC721 section of the code) can put a token up for sale, or accept a bid.

### For Sale Functions

`marketDeclareForSale(uint256 tokenId, uint256 minPriceInWei)`

Declare a token (identified by the ERC721 index `tokenId`) for sale, at a price `minPriceInWei`.

`marketDeclareForSaleToAddress(uint256 tokenId, uint256 minPriceInWei, address to)`

Declare a token (identified by the ERC721 index `tokenId`) for sale to a specific address `to`, at a price `minPriceInWei`. Only the address `to` can buy this token.

`marketWithdrawForSale(uint256 tokenId)`

Remove a "For Sale" declaration. Only the token owner can call this function.

`marketForSaleInfoByIndex(uint256 tokenId)`

Shows the "For Sale" status of a specific token (identified by the ERC721 index `tokenId`). The structure `marketForSaleInfoByIndex(tokenId)` contains a boolean indicating whether or not the token is for sale (`isForSale`), the ERC721 index of the token (`tokenId`), the current owner and seller of the token (`seller`), the pirce of the token (`minValue`) in Wei, and the address of the recipient (`onlySellTo`). If the recipient address is the zero address, then anyone can buy the token. Note that this function is a getter that directly access the structure, so it does not throw if the token `tokenId` does not exist, unlike all the other "For Sale" functions.

`marketBuyForSale(uint256 tokenId)`

Enables a user to buy a token (identified by the ERC721 index `tokenId`) that is up for sale. If `marketForSaleInfoByIndex(tokenId).onlySellto` returns the zero address, then any address can buy the token that is for sale. If `marketForSaleInfoByIndex(tokenId).onlySellto` returns a non-zero address, then only that address can buy the token that is for sale. Must send at least the sale price  (`marketForSaleInfoByIndex(tokenId).minValue`) to complete the transaction.

### Bid functions

`marketDeclareBid(uint256 tokenId)`

Enables a user to decalre a bid for a token (identified by the ERC721 index `tokenId`). The user must send the amount of the bid with the function call. If there is already a bid on the token (check `marketBidInfoByIndex(uint256 tokenId)`), the bid must be larger than `marketBidInfoByIndex(tokenId).value`, otherwise it throws. The previous bid is overwritten, and the amount of the previous bid is made available for withdraw through `marketWithdrawWei()`.

`marketWithdrawBid(uint256 tokenId)`

Enables a user to withdraw a bid on a token (identified by the ERC721 index `tokenId`) already made. Only the bidder `marketBidInfoByIndex(tokenId).bidder` can call this function. The bid is NOT automatically refunded: the user must call `marketWithdrawWei()`.

`marketAcceptBid(uint256 tokenId, uint256 minPrice)`

Enables a token owner to accept a bid, and transfer the token (identified by the ERC721 index `tokenId`) to the bidder. Only the token owner can call this function. The parameter `minPrice` must be smaller than or equal to `marketBidInfoByIndex(tokenId).value`. After calling this functin, the bid is NOT automatically transferred to the former owner: the former owner must call `marketWithdrawWei()`.

`marketBidInfoByIndex(uint256 tokenId)`

Shows the "Bid" status of a specific token (identified by the ERC721 index `tokenId`). The structure `marketBidInfoByIndex(tokenId)` contains a boolean indicating whether or not a bid for the token exists (`hasBid`), the ERC721 index of the token (`tokenId`), the current bidder for the token (`bidder`), and the bid (`value`) in Wei. Note that this function is a getter that directly access the structure, so it does not throw if the token `tokenId` does not exist, unlike all the other "Bid" functions.

`marketPendingWithdrawals(address holder)`

Shows the amount of ether (in wei) avaiable for the address `holder` to withdraw using `marketWithdrawWei()`.

`marketWithdrawWei()`

Enables a user to withdraw ether after a successful sale, after accepting a bid, after withdrawing a bid, or after another address outbids the user.


## ERC721 Functions
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
These functions are implemented with [OpenZeppelin code](https://github.com/OpenZeppelin/openzeppelin-solidity/tree/master/contracts/token/ERC721). For more information see the [ERC721 standard](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md).


