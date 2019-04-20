

// Focus of these tests is the market functions (for selling and bidding on tokens), and the
// ways in which they interact with ERC721 behavior.

// Uses Open Zeppelin helper functions: https://github.com/OpenZeppelin/openzeppelin-test-helpers

// All tests passed for the solidity program at mainnet address
// 0x6B9d46a223fFa343f8b14D855A8314B0EfF7fcb7

const { BN, constants, expectEvent, shouldFail } = require('openzeppelin-test-helpers');

//const { ZERO_ADDRESS } = "0x0000000000000000000000000000000000000000";
const { ZERO_ADDRESS } = constants;
const numQ = 13;

const Form = artifacts.require("FormSI060719");

contract("FormSI060719", function () {

    let instance;
    let accounts;
    let creator = 0; //don't change
/*
    let addr1 = 3;
    let addr2 = 5;
    let addr3 = 8;
    let addr4 = 9;
    let addr5 = 2;
    let q1 = 0;
    let q2 = 2;
    let q3 = numQ-2;
    let q4 = numQ-1;
    let amountWei1 = new BN(1000);
    let amountWei2 = new BN(3000);
    let amountWei3 = new BN(70000000000000);
*/    

    let addr1 = 1;
    let addr2 = 4;
    let addr3 = 8;
    let addr4 = 3;
    let addr5 = 5;
    let q1 = 1;
    let q2 = 10;
    let q3 = numQ-6;
    let q4 = numQ-9;
    let amountWei1 = new BN(2000);
    let amountWei2 = new BN(7000);
    let amountWei3 = new BN(1000000000000);
    
    beforeEach(async function(){
	instance = await Form.new();
	accounts = await web3.eth.getAccounts();
    });

 
    it("should have public function balanceOf that works correctly", async function () {

	let balance = await instance.balanceOf.call(accounts[creator]);
	assert.equal(balance.valueOf(), numQ);
	let balance2 = await instance.balanceOf.call(accounts[addr1]);
	assert.equal(balance2.valueOf(), 0);
	await shouldFail.reverting(instance.balanceOf(ZERO_ADDRESS));
    });

    it("should have public function ownerOf that works correctly", async function () {

	let owner1 = await instance.ownerOf.call(q1);
	assert.equal(owner1, accounts[creator]);
	await shouldFail.reverting(instance.ownerOf(numQ));
    });

    it('should allow users to answer questions and correctly assign ownership', async function (){

	await instance.answerQuestion(q2,"Account[addr2] answers question q2",{from:accounts[addr2]});
	await instance.answerQuestion(q2,"Account[creator] answers question q2",{from:accounts[creator]});
	await instance.answerQuestion(q4,"Account[addr2] answers question q4",{from:accounts[addr2]});

	let owner1 = await instance.ownerOf.call(numQ);
	let owner2 = await instance.ownerOf.call(numQ+1);
	let owner3 = await instance.ownerOf.call(numQ+2);

	assert.equal(owner1,accounts[addr2]);
	assert.equal(owner2,accounts[creator]);
	assert.equal(owner3,accounts[addr2]);
    });

    it('should allow users to answer questions and correctly keep track of indices', async function (){

	assert.equal(numQ, await instance.numberOfQuestions.call());
	
	await instance.answerQuestion(q1,"Account[addr2] answers question q1",{from:accounts[addr2]});
	let resultsA = await instance.answerQuestion(q2,
						     "Account[addr3] answers question q2",
						     {from:accounts[addr3]});
	await instance.answerQuestion(q3,"Account[addr1] answers question q3",{from:accounts[addr1]});
	await instance.answerQuestion(q4,"Account[creator] answers question q4",{from:accounts[creator]});
	let resultsB = await instance.answerQuestion(q3,
						     "Account[addr3] answers question q3",
						     {from:accounts[addr3]});
	await instance.answerQuestion(q2,"Account[addr1] answers question q2",{from:accounts[addr1]});

	assert.equal(resultsA.logs[0].event, 'QuestionAnswered');
	assert.equal(resultsA.logs[0].args.questionId, q2);
	assert.equal(resultsA.logs[0].args.answerId, 1);
	assert.equal(resultsA.logs[0].args.by, accounts[addr3]);

	assert.equal(resultsB.logs[0].event, 'QuestionAnswered');
	assert.equal(resultsB.logs[0].args.questionId, q3);
	assert.equal(resultsB.logs[0].args.answerId, 2);
	assert.equal(resultsB.logs[0].args.by, accounts[addr3]);

	let tS = await instance.getNumberOfAnswers.call(q2);
	assert.equal(tS.valueOf(), 2);
	let bal = await instance.balanceOf.call(accounts[addr3]);
	assert.equal(bal.valueOf(),2);

	let answer = await instance.getFormAnswers(q2,1);
	assert.equal("Account[addr3] answers question q2",answer);

	assert.equal((await instance.getIndexfromQA(q2,2)).valueOf(),numQ + 5);

	let pairQA = await instance.getQAfromIndex(numQ+2);
	assert.equal(pairQA[0].valueOf(),q3);
	assert.equal(pairQA[1].valueOf(),1);
	assert.equal((await instance.totalSupply()).valueOf(),numQ + 6); 
	
	await shouldFail.reverting(instance.getQAfromIndex(numQ+6));
	await shouldFail.reverting(instance.getIndexfromQA(q1,2));

    });

    describe('should have a working forSale market', async function(){

	let tokenId1
	let tokenId2
	let tokenId3
	let results
	let results3

	
	beforeEach(async function(){
	    await instance.answerQuestion(q2,"Account[addr2] answers question q2",{from:accounts[addr2]});
	    await instance.answerQuestion(q1,"Account[addr3] answers question q1",{from:accounts[addr3]});
	    await instance.answerQuestion(q3,"Account[addr2] answers question q3",{from:accounts[addr2]});
	    await instance.answerQuestion(q1,"Account[addr2] answers question q1",{from:accounts[addr2]});
	    await instance.answerQuestion(q4,"Account[addr1] answers question q4",{from:accounts[addr1]});
	    await instance.answerQuestion(q4,"Account[addr2] answers question q4",{from:accounts[addr2]});
	    await instance.answerQuestion(q1,"Accounts[creator] answers question q1",{from:accounts[creator]});
	    tokenId1 = numQ + 5;
	    tokenId2 = numQ + 4;
	    tokenId3 = numQ + 2;
	    results =  await instance.marketDeclareForSale(tokenId1, amountWei1, {from:accounts[addr2]});
	    results3 =  await instance.marketDeclareForSaleToAddress(tokenId2,
								     amountWei2,
								     accounts[creator],
								     {from:accounts[addr1]});
	});




	    
	it('when declaring for sale',async function(){

	    // Check indices again for fun
    	    assert.equal((await instance.totalSupply()).valueOf(),numQ + 7);
	    let tS = await instance.getNumberOfAnswers.call(q2);
	    assert.equal(tS.valueOf(), 1);
	    let bal = await instance.balanceOf.call(accounts[addr2]);
	    assert.equal(bal.valueOf(),4);

	    assert.equal((await instance.getIndexfromQA(q1,2)).valueOf(),numQ + 3);

	    let pairQA = await instance.getQAfromIndex(numQ+6);
	    assert.equal(pairQA[0].valueOf(),q1);
	    assert.equal(pairQA[1].valueOf(),3);

	    // only token owner should be able to DecareForSale.
	    await shouldFail.reverting(instance.marketDeclareForSale(tokenId1, amountWei1, {from:accounts[addr3]}));

	    
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId1)).isForSale, true);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId1)).tokenId.valueOf(), tokenId1);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId1)).seller, accounts[addr2]);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId1)).minValue.valueOf(), amountWei1.toNumber());
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId1)).onlySellTo, ZERO_ADDRESS);

	    assert.equal(results.logs[0].event, 'ForSaleDeclared');
	    assert.equal(results.logs[0].args.tokenId, tokenId1);
	    assert.equal(results.logs[0].args.from, accounts[addr2]);
	    assert.equal(results.logs[0].args.minValue.valueOf(), amountWei1.toNumber());
	    assert.equal(results.logs[0].args.to, ZERO_ADDRESS);
	});

	it('when overwriting previous for sale', async function(){

	    let results2 =  await instance.marketDeclareForSale(tokenId1, amountWei3, {from:accounts[addr2]});
	    
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId1)).isForSale, true);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId1)).tokenId.valueOf(), tokenId1);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId1)).seller, accounts[addr2]);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId1)).minValue.valueOf(), amountWei3.toNumber());
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId1)).onlySellTo, ZERO_ADDRESS);

	    assert.equal(results2.logs[0].event, 'ForSaleDeclared');
	    assert.equal(results2.logs[0].args.tokenId, tokenId1);
	    assert.equal(results2.logs[0].args.from, accounts[addr2]);
	    assert.equal(results2.logs[0].args.minValue.valueOf(), amountWei3.toNumber());
	    assert.equal(results2.logs[0].args.to, ZERO_ADDRESS);
	});

	it('when declaring for sale to address', async function(){

	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId2)).isForSale, true);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId2)).tokenId.valueOf(), tokenId2);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId2)).seller, accounts[addr1]);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId2)).minValue.valueOf(), amountWei2.toNumber());
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId2)).onlySellTo, accounts[creator]);

	    assert.equal(results3.logs[0].event, 'ForSaleDeclared');
	    assert.equal(results3.logs[0].args.tokenId, tokenId2);
	    assert.equal(results3.logs[0].args.from, accounts[addr1]);
	    assert.equal(results3.logs[0].args.minValue.valueOf(), amountWei2.toNumber());
	    assert.equal(results3.logs[0].args.to, accounts[creator]);
	});

	it('when withdrawing for sale', async function(){

	    await(shouldFail.reverting(instance.marketWithdrawForSale(tokenId1, {from:accounts[addr3]})));

	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId1)).isForSale, true);

	    let results4 =  await instance.marketWithdrawForSale(tokenId1, {from:accounts[addr2]});
	    
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId1)).isForSale, false);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId1)).tokenId.valueOf(), tokenId1);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId1)).seller, ZERO_ADDRESS);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId1)).minValue.valueOf(), 0);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId1)).onlySellTo, ZERO_ADDRESS);

	    assert.equal(results4.logs[0].event, 'ForSaleWithdrawn');
	    assert.equal(results4.logs[0].args.tokenId, tokenId1);
	    assert.equal(results4.logs[0].args.from, accounts[addr2]);
	});

	it('when buying for sale', async function(){

	    await(shouldFail.reverting(instance.marketBuyForSale(tokenId2,{from:accounts[addr3],
									       value:amountWei3})));
	    await(shouldFail.reverting(instance.marketBuyForSale(tokenId2,{from:accounts[creator],
									       value:(amountWei2 - 1)})));
	    let initVal = new BN(await instance.marketPendingWithdrawals(accounts[addr1]));
	    let initOwner = await instance.ownerOf(tokenId2);
	    let results5 = await instance.marketBuyForSale(tokenId2,{from:accounts[creator],
									 value:amountWei2});
	    let newOwner = await instance.ownerOf(tokenId2);
	    assert.equal(initOwner,accounts[addr1]);
	    assert.equal(newOwner,accounts[creator]);
	    
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId2)).isForSale, false);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId2)).tokenId.valueOf(), tokenId2);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId2)).seller, ZERO_ADDRESS);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId2)).minValue.valueOf(), 0);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId2)).onlySellTo, ZERO_ADDRESS);

	    assert.equal(results5.logs[0].event, 'Transfer');
	    assert.equal(results5.logs[0].args.from, accounts[addr1]);
	    assert.equal(results5.logs[0].args.to, accounts[creator]);
	    assert.equal(results5.logs[0].args.tokenId.valueOf(),tokenId2);
		
	    assert.equal(results5.logs[1].event, 'ForSaleWithdrawn');
	    assert.equal(results5.logs[1].args.tokenId, tokenId2);
	    assert.equal(results5.logs[1].args.from, accounts[creator]);

	    assert.equal(results5.logs[2].event, 'ForSaleBought');
	    assert.equal(results5.logs[2].args.tokenId, tokenId2);
	    assert.equal(results5.logs[2].args.value.valueOf(), amountWei2.toNumber());
	    assert.equal(results5.logs[2].args.from, accounts[addr1]);
	    assert.equal(results5.logs[2].args.to, accounts[creator]);
	    let finalVal = new BN(await instance.marketPendingWithdrawals(accounts[addr1]));
	    assert.equal(finalVal.toNumber(),initVal.add(amountWei2).toNumber());


	    //tokenId1
	    await(shouldFail.reverting(instance.marketBuyForSale(tokenId1,{from:accounts[addr3],
									   value:(amountWei1 - 1)})));
	    await(shouldFail.reverting(instance.marketBuyForSale(tokenId3,{from:accounts[addr3],
									   value:amountWei1})));
	    let initVal2 = new BN(await instance.marketPendingWithdrawals(accounts[addr2]));
	    let results6 = await instance.marketBuyForSale(tokenId1,{from:accounts[addr3],
								     value:amountWei1});
	    assert.equal(results6.logs[0].event, 'Transfer');
	    assert.equal(results6.logs[0].args.from, accounts[addr2]);
	    assert.equal(results6.logs[0].args.to, accounts[addr3]);
	    assert.equal(results6.logs[0].args.tokenId.valueOf(),tokenId1);
		
	    assert.equal(results6.logs[1].event, 'ForSaleWithdrawn');
	    assert.equal(results6.logs[1].args.tokenId, tokenId1);
	    assert.equal(results6.logs[1].args.from, accounts[addr3]);

	    assert.equal(results6.logs[2].event, 'ForSaleBought');
	    assert.equal(results6.logs[2].args.tokenId, tokenId1);
	    assert.equal(results6.logs[2].args.value.valueOf(), amountWei1.toNumber());
	    assert.equal(results6.logs[2].args.from, accounts[addr2]);
	    assert.equal(results6.logs[2].args.to, accounts[addr3]);
	    
	    let finalVal2 = new BN(await instance.marketPendingWithdrawals(accounts[addr2]));

	    assert.equal(finalVal2.toNumber(),initVal2.add(amountWei1).toNumber());

	    
	});
	    
    });
    
    describe('should have a working Bidding market', async function(){

	let tokenId1
	let tokenId2
	let tokenId3
	let tokenId4
	let results1
	let results2
	let results3

	
	beforeEach(async function(){
	    await instance.answerQuestion(q1,"Account[addr1] answers question q1",{from:accounts[addr1]});
	    await instance.answerQuestion(q4,"Account[addr2] answers question q4",{from:accounts[addr2]});
	    await instance.answerQuestion(q3,"Account[creator] answers question q3",{from:accounts[creator]});
	    await instance.answerQuestion(q3,"Account[addr3] answers question q3",{from:accounts[addr3]});
	    await instance.answerQuestion(q4,"Account[addr1] answers question q4",{from:accounts[addr1]});
	    await instance.answerQuestion(q2,"Account[addr3] answers question q2",{from:accounts[addr3]});
	    await instance.answerQuestion(q3,"Account[addr2] answers question q3",{from:accounts[addr2]});
	    await instance.answerQuestion(q1,"Account[addr2] answers question q1",{from:accounts[addr2]});
	    tokenId1 = numQ + 3;
	    tokenId2 = numQ + 7;
	    tokenId3 = 2;
	    tokenId4 = numQ;
	    results1 =  await instance.marketDeclareBid(tokenId1, {from:accounts[addr1], value:amountWei1});
	    results2 =  await instance.marketDeclareBid(tokenId2, {from:accounts[addr3], value: amountWei1});
	    results3 =  await instance.marketDeclareBid(tokenId3, {from:accounts[addr1], value: amountWei2});
								    
	});


	it('when declaring bids',async function(){
	   
	   // assert.equal((await instance.ownerOf(numQ)),accounts[addr1]);
	    await(shouldFail.reverting(instance.marketDeclareBid(tokenId2, {from:accounts[addr2], value: amountWei1})));
	    await(shouldFail.reverting(instance.marketDeclareBid(tokenId3, {from:accounts[addr1]})));
	    await(shouldFail.reverting(instance.marketDeclareBid(tokenId2 + 3, {from:accounts[addr2],
										value: amountWei1})));

	    assert.equal((await instance.marketBidInfoByIndex(tokenId1)).hasBid, true);
	    assert.equal((await instance.marketBidInfoByIndex(tokenId1)).tokenId.valueOf(), tokenId1);
	    assert.equal((await instance.marketBidInfoByIndex(tokenId1)).bidder, accounts[addr1]);
	    assert.equal((await instance.marketBidInfoByIndex(tokenId1)).value.valueOf(), amountWei1.toNumber());

	    assert.equal(results1.logs[0].event, 'BidDeclared');
	    assert.equal(results1.logs[0].args.tokenId, tokenId1);
	    assert.equal(results1.logs[0].args.value.valueOf(), amountWei1.toNumber());
	    assert.equal(results1.logs[0].args.from, accounts[addr1]);

	});

	it('when overwriting bids', async function(){

	    await(shouldFail.reverting(instance.marketDeclareBid(tokenId2, {from:accounts[addr2],
									    value: amountWei1})));

	    let results4 = await instance.marketDeclareBid(tokenId1, {from:accounts[addr2], value: amountWei2});
	    let results5 = await instance.marketDeclareBid(tokenId3, {from:accounts[addr1], value: amountWei3});

	    assert.equal((await instance.marketBidInfoByIndex(tokenId1)).bidder, accounts[addr2]);
	    assert.equal((await instance.marketBidInfoByIndex(tokenId1)).value.valueOf(), amountWei2.toNumber());

	    assert.equal(results4.logs[0].event, 'BidDeclared');
	    assert.equal(results4.logs[0].args.tokenId, tokenId1);
	    assert.equal(results4.logs[0].args.value.valueOf(), amountWei2.toNumber());
	    assert.equal(results4.logs[0].args.from, accounts[addr2]);

	    assert.equal((await instance.marketBidInfoByIndex(tokenId3)).hasBid, true);
	    assert.equal((await instance.marketBidInfoByIndex(tokenId3)).tokenId.valueOf(), tokenId3);
	    assert.equal((await instance.marketBidInfoByIndex(tokenId3)).bidder, accounts[addr1]);
	    assert.equal((await instance.marketBidInfoByIndex(tokenId3)).value.valueOf(), amountWei3.toNumber());

	    assert.equal(results5.logs[0].event, 'BidDeclared');
	    assert.equal(results5.logs[0].args.tokenId, tokenId3);
	    assert.equal(results5.logs[0].args.value.valueOf(), amountWei3.toNumber());
	    assert.equal(results5.logs[0].args.from, accounts[addr1]);

	    await instance.marketDeclareBid(tokenId1, {from:accounts[creator], value: amountWei3});

	    
	    assert.equal((await instance.marketPendingWithdrawals(accounts[addr1])) ,
			 amountWei1.add(amountWei2).toNumber());
	    assert.equal((await instance.marketPendingWithdrawals(accounts[addr2])) , amountWei2.toNumber());
	    

	});

	it('when withdrawing bids', async function(){
	    
	    await(shouldFail.reverting(instance.marketWithdrawBid(tokenId2+3, {from:accounts[addr3]})));	    
	    await(shouldFail.reverting(instance.marketWithdrawBid(tokenId2, {from:accounts[addr2]})));	    
	    await(shouldFail.reverting(instance.marketWithdrawBid(tokenId4, {from:accounts[addr2]})));

	    let results4 = await instance.marketWithdrawBid(tokenId1,  {from:accounts[addr1]});
	    let results5 = await instance.marketWithdrawBid(tokenId2,  {from:accounts[addr3]});
	    let results6 = await instance.marketWithdrawBid(tokenId3,  {from:accounts[addr1]});
	    await(shouldFail.reverting(instance.marketWithdrawBid(tokenId1, {from:accounts[addr1]})));


	    assert.equal((await instance.marketBidInfoByIndex(tokenId1)).hasBid, false);
	    assert.equal((await instance.marketBidInfoByIndex(tokenId1)).tokenId.valueOf(), tokenId1);
	    assert.equal((await instance.marketBidInfoByIndex(tokenId1)).bidder, ZERO_ADDRESS);
	    assert.equal((await instance.marketBidInfoByIndex(tokenId1)).value.valueOf(), 0);

	    assert.equal(results4.logs[0].event, 'BidWithdrawn');
	    assert.equal(results4.logs[0].args.tokenId, tokenId1);
	    assert.equal(results4.logs[0].args.value.valueOf(), amountWei1.toNumber());
	    assert.equal(results4.logs[0].args.from, accounts[addr1]);

	    assert.equal((await instance.marketBidInfoByIndex(tokenId3)).hasBid, false);
	    assert.equal((await instance.marketBidInfoByIndex(tokenId3)).tokenId.valueOf(), tokenId3);
	    assert.equal((await instance.marketBidInfoByIndex(tokenId3)).bidder, ZERO_ADDRESS);
	    assert.equal((await instance.marketBidInfoByIndex(tokenId3)).value.valueOf(), 0);

	    assert.equal(results5.logs[0].event, 'BidWithdrawn');
	    assert.equal(results5.logs[0].args.tokenId, tokenId2);
	    assert.equal(results5.logs[0].args.value.valueOf(), amountWei1.toNumber());
	    assert.equal(results5.logs[0].args.from, accounts[addr3]);


	    assert.equal((await instance.marketPendingWithdrawals(accounts[addr1])) ,
			 amountWei1.add(amountWei2).toNumber());
	    assert.equal((await instance.marketPendingWithdrawals(accounts[addr3])) , amountWei1.toNumber());



	});

	it('when accepting bids', async function(){

	    await(shouldFail.reverting(instance.marketAcceptBid(tokenId2+1,
								amountWei1,
								{from:accounts[addr2]})));
	    await(shouldFail.reverting(instance.marketAcceptBid(tokenId3,
								amountWei1,
								{from:accounts[addr2]})));	    
	    await(shouldFail.reverting(instance.marketAcceptBid(tokenId4,
								amountWei1,
								{from:accounts[addr1]})));	    
	    await(shouldFail.reverting(instance.marketAcceptBid(tokenId3,
								amountWei3,
								{from:accounts[creator]})));	    
	    let results4 = await instance.marketAcceptBid(tokenId1, amountWei1 - 1, {from: accounts[addr3]});
	    let results5 = await instance.marketAcceptBid(tokenId2, 0, {from: accounts[addr2]});
	    let results6 = await instance.marketAcceptBid(tokenId3, amountWei1, {from: accounts[creator]});

	    assert.equal( (await instance.ownerOf(tokenId1)), accounts[addr1] );
	    assert.equal( (await instance.ownerOf(tokenId2)), accounts[addr3] );
	    assert.equal( (await instance.ownerOf(tokenId3)), accounts[addr1] );

	    assert.equal((await instance.marketBidInfoByIndex(tokenId1)).hasBid, false);
	    assert.equal((await instance.marketBidInfoByIndex(tokenId1)).tokenId.valueOf(), tokenId1);
	    assert.equal((await instance.marketBidInfoByIndex(tokenId1)).bidder, ZERO_ADDRESS);
	    assert.equal((await instance.marketBidInfoByIndex(tokenId1)).value.valueOf(), 0);
	    
	    assert.equal(results4.logs[0].event, 'ForSaleWithdrawn');
	    assert.equal(results4.logs[0].args.tokenId, tokenId1);
	    assert.equal(results4.logs[0].args.from, accounts[addr3]);

	    assert.equal(results4.logs[1].event, 'Transfer');
	    assert.equal(results4.logs[1].args.from, accounts[addr3]);
	    assert.equal(results4.logs[1].args.to, accounts[addr1]);
	    assert.equal(results4.logs[1].args.tokenId.valueOf(),tokenId1);
		
	    assert.equal(results4.logs[2].event, 'BidAccepted');
	    assert.equal(results4.logs[2].args.tokenId, tokenId1);
	    assert.equal(results4.logs[2].args.value.valueOf(), amountWei1.toNumber());
	    assert.equal(results4.logs[2].args.from, accounts[addr3]);
	    assert.equal(results4.logs[2].args.to, accounts[addr1]);

	    assert.equal((await instance.marketBidInfoByIndex(tokenId3)).hasBid, false);
	    assert.equal((await instance.marketBidInfoByIndex(tokenId3)).tokenId.valueOf(), tokenId3);
	    assert.equal((await instance.marketBidInfoByIndex(tokenId3)).bidder, ZERO_ADDRESS);
	    assert.equal((await instance.marketBidInfoByIndex(tokenId3)).value.valueOf(), 0);
	    
	    assert.equal(results6.logs[0].event, 'ForSaleWithdrawn');
	    assert.equal(results6.logs[0].args.tokenId, tokenId3);
	    assert.equal(results6.logs[0].args.from, accounts[creator]);

	    assert.equal(results6.logs[1].event, 'Transfer');
	    assert.equal(results6.logs[1].args.from, accounts[creator]);
	    assert.equal(results6.logs[1].args.to, accounts[addr1]);
	    assert.equal(results6.logs[1].args.tokenId.valueOf(),tokenId3);
		
	    assert.equal(results6.logs[2].event, 'BidAccepted');
	    assert.equal(results6.logs[2].args.tokenId, tokenId3);
	    assert.equal(results6.logs[2].args.value.valueOf(), amountWei2.toNumber());
	    assert.equal(results6.logs[2].args.from, accounts[creator]);
	    assert.equal(results6.logs[2].args.to, accounts[addr1]);

	    assert.equal((await instance.marketPendingWithdrawals(accounts[addr3])) , amountWei1.toNumber());
	    assert.equal((await instance.marketPendingWithdrawals(accounts[addr2])) , amountWei1.toNumber());
	    assert.equal((await instance.marketPendingWithdrawals(accounts[creator])) , amountWei2.toNumber());
	    assert.equal((await instance.marketPendingWithdrawals(accounts[addr1])) , 0);

	    let initBal = new BN(await web3.eth.getBalance(accounts[addr3]));
	    let results7 = await instance.marketWithdrawWei({from:accounts[addr3]});
	    let finBal = new BN(await web3.eth.getBalance(accounts[addr3]));
	    let gP = new BN( (await web3.eth.getTransaction(results7.tx)).gasPrice );
	    let gas = new BN(results7.receipt.gasUsed);
	    let gTP = gP.mul(gas);
	    let delta = finBal.sub(initBal);
	    assert.equal( amountWei1.sub(delta).toNumber(), gTP.toNumber());

	    
	});
	     
	    
	    

    });
    

    describe ('should transfer tokens correctly',async function(){

	let tokenId1
	let tokenId2
	let tokenId3
	let tokenId4
	let tokenId5
	let results1
	let results2
	let results3
	
	beforeEach(async function(){
	    await instance.answerQuestion(q1,"Account[addr1] answers question q1",{from:accounts[addr1]});
	    await instance.answerQuestion(q1,"Account[addr2] answers question q1",{from:accounts[addr2]});
	    await instance.answerQuestion(q3,"Account[addr1] answers question q3",{from:accounts[addr1]});
	    await instance.answerQuestion(q3,"Account[creator] answers question q3",{from:accounts[creator]});
	    await instance.answerQuestion(q4,"Account[addr1] answers question q4",{from:accounts[addr1]});
	    await instance.answerQuestion(q2,"Account[addr3] answers question q2",{from:accounts[addr3]});
	    await instance.answerQuestion(q4,"Account[addr2] answers question q4",{from:accounts[addr2]});
	    await instance.answerQuestion(q1,"Account[addr2] answers question q1",{from:accounts[addr2]});
	    tokenId1 = 3; // must be a question
	    tokenId2 = numQ - 1; //must be a question
	    tokenId3 = numQ + 4;
	    tokenId4 = numQ + 6; //must stay with addr2
	    tokenId5 = numQ + 7; //must stay with addr2
	    await instance.marketDeclareBid(tokenId1, {from:accounts[addr4], value:amountWei1});
	    await instance.marketDeclareBid(tokenId2, {from:accounts[addr3], value: amountWei1});
	    await instance.marketDeclareBid(tokenId4, {from:accounts[creator], value: amountWei2});
	    await instance.marketDeclareForSale(tokenId1, amountWei3, {from:accounts[creator]});
	    await instance.marketDeclareForSale(tokenId4, amountWei3, {from:accounts[addr2]});			
	});

	it('when transferred by owner', async function(){
	    await shouldFail.reverting(instance.transferFrom( (await instance.ownerOf(tokenId1)),
							     ZERO_ADDRESS,
							     tokenId1,
							      {from: accounts[creator]}));
	    await shouldFail.reverting(instance.transferFrom( (await instance.ownerOf(tokenId3)),
							     accounts[addr4],
							     tokenId3,
							     {from: accounts[addr2]}));

	    assert.equal( (await instance.marketBidInfoByIndex(tokenId1)).hasBid, true);
	    assert.equal( (await instance.marketForSaleInfoByIndex(tokenId1)).isForSale, true);
	    
	    let results4 = await instance.transferFrom((await instance.ownerOf(tokenId1)),
						       accounts[addr4],
						       tokenId1,
						       {from:accounts[creator]});

	    assert.equal((await instance.marketBidInfoByIndex(tokenId1)).hasBid, false);
	    assert.equal((await instance.marketBidInfoByIndex(tokenId1)).tokenId.valueOf(), tokenId1);
	    assert.equal((await instance.marketBidInfoByIndex(tokenId1)).bidder, ZERO_ADDRESS);
	    assert.equal((await instance.marketBidInfoByIndex(tokenId1)).value.valueOf(), 0);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId1)).isForSale, false);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId1)).tokenId.valueOf(), tokenId1);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId1)).seller, ZERO_ADDRESS);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId1)).minValue.valueOf(), 0);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId1)).onlySellTo, ZERO_ADDRESS);
	    
	    assert.equal(results4.logs[0].event, 'ForSaleWithdrawn');
	    assert.equal(results4.logs[0].args.tokenId, tokenId1);
	    assert.equal(results4.logs[0].args.from, accounts[creator]);

	    assert.equal(results4.logs[1].event, 'Transfer');
	    assert.equal(results4.logs[1].args.from, accounts[creator]);
	    assert.equal(results4.logs[1].args.to, accounts[addr4]);
	    assert.equal(results4.logs[1].args.tokenId.valueOf(),tokenId1);
		
	    assert.equal(results4.logs[2].event, 'BidWithdrawn');
	    assert.equal(results4.logs[2].args.tokenId, tokenId1);
	    assert.equal(results4.logs[2].args.value.valueOf(), amountWei1.toNumber());
	    assert.equal(results4.logs[2].args.from, accounts[addr4]);

	    assert.equal(results4.logs.length, 3);

	    assert.equal((await instance.marketPendingWithdrawals(accounts[addr4])) , amountWei1.toNumber());

	    assert.equal( (await instance.marketBidInfoByIndex(tokenId4)).hasBid, true);
	    assert.equal( (await instance.marketForSaleInfoByIndex(tokenId4)).isForSale, true);
	    
	    let results5 = await instance.transferFrom((await instance.ownerOf(tokenId4)),
						   accounts[addr1],
						   tokenId4,
						       {from:accounts[addr2]});

	    assert.equal((await instance.marketBidInfoByIndex(tokenId4)).hasBid, true);
	    assert.equal((await instance.marketBidInfoByIndex(tokenId4)).tokenId.valueOf(), tokenId4);
	    assert.equal((await instance.marketBidInfoByIndex(tokenId4)).bidder, accounts[creator]);
	    assert.equal((await instance.marketBidInfoByIndex(tokenId4)).value.valueOf(),
			 amountWei2.toNumber());
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId4)).isForSale, false);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId4)).tokenId.valueOf(), tokenId4);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId4)).seller, ZERO_ADDRESS);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId4)).minValue.valueOf(), 0);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId4)).onlySellTo, ZERO_ADDRESS);
	    
	    assert.equal(results5.logs[0].event, 'ForSaleWithdrawn');
	    assert.equal(results5.logs[0].args.tokenId, tokenId4);
	    assert.equal(results5.logs[0].args.from, accounts[addr2]);

	    assert.equal(results5.logs[1].event, 'Transfer');
	    assert.equal(results5.logs[1].args.from, accounts[addr2]);
	    assert.equal(results5.logs[1].args.to, accounts[addr1]);
	    assert.equal(results5.logs[1].args.tokenId.valueOf(),tokenId4);

	    assert.equal(results5.logs.length, 2);
		
	});

	it('when transferred by an authorized user', async function(){

	    await shouldFail.reverting(instance.approve(accounts[addr4],
							tokenId1,
							{from:accounts[addr2]}));

	    await shouldFail.reverting(instance.approve(accounts[creator],
							tokenId1,
							{from:accounts[creator]}));
	    
	    await shouldFail.reverting(instance.approve(accounts[addr1],
							tokenId4,
							{from:accounts[addr5]}));

	    await shouldFail.reverting(instance.setApprovalForAll(accounts[addr2],
								  true,
								  {from:accounts[addr2]}));
	    

	    await instance.approve(accounts[addr3],tokenId1,{from:accounts[creator]});
	    await instance.approve(accounts[addr4],tokenId3,{from:accounts[addr1]});
	    await instance.setApprovalForAll(accounts[addr5],true, {from:accounts[addr2]});


	    await shouldFail.reverting(instance.marketAcceptBid(tokenId1,
							       0,
								{from:accounts[addr3]}));

	    await shouldFail.reverting(instance.marketDeclareForSale(tokenId1,
								     amountWei1,
								     {from:accounts[addr3]}));

	    await shouldFail.reverting(instance.marketAcceptBid(tokenId4,
							       0,
							       {from:accounts[addr5]}));

	    await shouldFail.reverting(instance.marketDeclareForSale(tokenId4,
								     amountWei1,
								     {from:accounts[addr5]}));

	    assert.equal( (await instance.marketBidInfoByIndex(tokenId1)).hasBid, true);
	    assert.equal( (await instance.marketForSaleInfoByIndex(tokenId1)).isForSale, true);
	    
	    let results4 = await instance.transferFrom(accounts[creator],
						       accounts[addr4],
						       tokenId1,
						       {from:accounts[addr3]});

	    assert.equal((await instance.marketBidInfoByIndex(tokenId1)).hasBid, false);
	    assert.equal((await instance.marketBidInfoByIndex(tokenId1)).tokenId.valueOf(), tokenId1);
	    assert.equal((await instance.marketBidInfoByIndex(tokenId1)).bidder, ZERO_ADDRESS);
	    assert.equal((await instance.marketBidInfoByIndex(tokenId1)).value.valueOf(), 0);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId1)).isForSale, false);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId1)).tokenId.valueOf(), tokenId1);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId1)).seller, ZERO_ADDRESS);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId1)).minValue.valueOf(), 0);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId1)).onlySellTo, ZERO_ADDRESS);
	    
	    assert.equal(results4.logs[0].event, 'ForSaleWithdrawn');
	    assert.equal(results4.logs[0].args.tokenId, tokenId1);
	    assert.equal(results4.logs[0].args.from, accounts[creator]);

	    assert.equal(results4.logs[1].event, 'Transfer');
	    assert.equal(results4.logs[1].args.from, accounts[creator]);
	    assert.equal(results4.logs[1].args.to, accounts[addr4]);
	    assert.equal(results4.logs[1].args.tokenId.valueOf(),tokenId1);
		
	    assert.equal(results4.logs[2].event, 'BidWithdrawn');
	    assert.equal(results4.logs[2].args.tokenId, tokenId1);
	    assert.equal(results4.logs[2].args.value.valueOf(), amountWei1.toNumber());
	    assert.equal(results4.logs[2].args.from, accounts[addr4]);

	    assert.equal(results4.logs.length, 3);
	    
	    
	    assert.equal((await instance.marketPendingWithdrawals(accounts[addr4])) , amountWei1.toNumber());

	    assert.equal( (await instance.marketBidInfoByIndex(tokenId4)).hasBid, true);
	    assert.equal( (await instance.marketForSaleInfoByIndex(tokenId4)).isForSale, true);
	    
	    let results5 = await instance.transferFrom(accounts[addr2],
						       accounts[addr1],
						       tokenId4,
						       {from:accounts[addr5]});

	    assert.equal((await instance.marketBidInfoByIndex(tokenId4)).hasBid, true);
	    assert.equal((await instance.marketBidInfoByIndex(tokenId4)).tokenId.valueOf(), tokenId4);
	    assert.equal((await instance.marketBidInfoByIndex(tokenId4)).bidder, accounts[creator]);
	    assert.equal((await instance.marketBidInfoByIndex(tokenId4)).value.valueOf(),
			 amountWei2.toNumber());
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId4)).isForSale, false);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId4)).tokenId.valueOf(), tokenId4);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId4)).seller, ZERO_ADDRESS);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId4)).minValue.valueOf(), 0);
	    assert.equal((await instance.marketForSaleInfoByIndex(tokenId4)).onlySellTo, ZERO_ADDRESS);
	    
	    assert.equal(results5.logs[0].event, 'ForSaleWithdrawn');
	    assert.equal(results5.logs[0].args.tokenId, tokenId4);
	    assert.equal(results5.logs[0].args.from, accounts[addr2]);

	    assert.equal(results5.logs[1].event, 'Transfer');
	    assert.equal(results5.logs[1].args.from, accounts[addr2]);
	    assert.equal(results5.logs[1].args.to, accounts[addr1]);
	    assert.equal(results5.logs[1].args.tokenId.valueOf(),tokenId4);

	    assert.equal(results5.logs.length, 2);

	    
	});

    });

	
});
	
