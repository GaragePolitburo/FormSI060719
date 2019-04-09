

# FormSI060719

Information and code relating to FormSI060719, which is part of the show "Garage Politburo" at Susan Inglett Gallery, NY from June 7, 2019 - July 26, 2019

Based on code by OpenZeppelin: https://github.com/OpenZeppelin/openzeppelin-solidity/tree/master/contracts/token/ERC721. Code uses Jan 4 2019 Open Zepplin package 76abd1a41ec7d96ef76370f3eadfe097226896a2.

Based also on CryptoPunks by Larva Labs: https://github.com/larvalabs/cryptopunks

Text snippets in FormSI060719 are taken from Masha Gessen, Nisi Shawl, Margaret Thatcher, Fredric Jameson, Paul Preciado, Leni Zumas, Philip Roth, Omar El Akkad, Wayne La Pierre, David Graeber, Walt Whitman, George Orwell, Rudyard Kipling, and Donna Haraway.


FormSI060719 is a solidity program on the ethereum mainnet at address %%%%%%%%%. It is a form with 13 question, and a user can answer any question(s) the individual wants. The questions and answers are state variables (stored on the blockchain), and behave as [ERC721 tokens](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md). 

There three types of functions: standard ERC721 functions, form functions (for reading and answering form questions), and market functions (for bidding on tokens, or putting them up for sale) 

The form functions are:

`getFormQuestion(uint256 questionId)`

Provides text of one of the 13 form questions, identified by `questionId`, which varies between 0 and 12 (NOT 1 to 13).

`answerQuestion(uint256 questionId, string answer)`

Allows user to answer a question, identified by `questionId`. The string `answer` will be associated with this question, and stored on the blockchain. 

```
getIndexfromQA(uint256 questionId, uint256 textId)
getQAfromIndex(uint256 tokenId)
```
Provides indices for question and answer text. Each has an ERC721 token index (`tokenId`), which starts at zero, and goes high enough to accommodate all questions and answers. Each also has a QA index pair (`questionId, textId`). The index `questionId` identifies the question and varies from 0 to 12. When the index `textId` is zero, the question itself is selected. When the index `textId` is greater than zero, it selects an answer associated with `questionId`. The function `getIndexfromQA(uint256 questionId, uint256 textId)` takes in a QA index pair, and returns the ERC721 token index. The function `getQAfromIndex(uint256 tokenId)` takes in the ERC721 token index, and returns a QA index pair. If any of the indices are out of bounds (using 14 for `questionId`, for example), the function reverts.


The ERC721 functions are:
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
