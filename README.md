

# FormSI060719

Information and code relating to FormSI060719, which is part of the show "Garage Politburo" at Susan Inglett Gallery, NY from June 7, 2019 - July 26, 2019

Based on code by OpenZeppelin: https://github.com/OpenZeppelin/openzeppelin-solidity/tree/master/contracts/token/ERC721. Code uses Jan 4 2019 Open Zepplin package 76abd1a41ec7d96ef76370f3eadfe097226896a2.

Based also on CryptoPunks by Larva Labs: https://github.com/larvalabs/cryptopunks

Text snippets in FormSI060719 are taken from Masha Gessen, Nisi Shawl, Margaret Thatcher, Fredric Jameson, Paul Preciado, Leni Zumas, Philip Roth, Omar El Akkad, Wayne La Pierre, David Graeber, Walt Whitman, George Orwell, Rudyard Kipling, and Donna Haraway.


FormSI060719 is a solidity program on the ethereum mainnet at address 0x6B9d46a223fFa343f8b14D855A8314B0EfF7fcb7. It is a form with 13 question, and a user can answer any question(s) the individual wants. The questions and answers are state variables (stored on the blockchain), and behave as [ERC721 tokens](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md). 

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

All money amounts are in wei (1 wei = 10^18 ether)

Only the token owner (and not other authorized users from the ERC721 section of the code) can put a token up for sale, or accept a bid.

### For Sale Functions

`marketDeclareForSale(uint256 tokenId, uint256 minPriceInWei)`

Declare a token (identified by the ERC721 index `tokenId`) for sale, at a price `minPriceInWei`.

`marketDeclareForSaleToAddress(uint256 tokenId, uint256 minPriceInWei, address to)`

Declare a token (identified by the ERC721 index `tokenId`) for sale to a specific address `to`, at a price `minPriceInWei`. Only the address `to` can buy this token.

`marketWithdrawForSale(uint256 tokenId)`

Remove a "For Sale" declaration. Only the token owner can call this function.

`marketForSaleInfoByIndex(uint256 tokenId)`

`marketBuyForSale(uint256 tokenId)`

### Bid functions

`marketDeclareBid(uint256 tokenId)`

`marketWithdrawBid(uint256 tokenId)`

`marketAcceptBid(uint256 tokenId, uint256 minPrice)`

`marketBidInfoByIndex(uint256 tokenId)`

`marketPendingWithdrawals(address holder)`

`marketWithdrawWei()`


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
function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data)
```
These functions are implemented with [OpenZeppelin code](https://github.com/OpenZeppelin/openzeppelin-solidity/tree/master/contracts/token/ERC721). For more information see the [ERC721 standard](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md).





Testing file

Ethereum address
