// contract test code will go here
const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const compiler = require('../compile');
const { abi, evm } = compiler.getCompany();

let accounts, company;

beforeEach(async () => {
    accounts = await new web3.eth.getAccounts();
    company = await new web3.eth.Contract(abi)
                .deploy({ data : evm.bytecode.object, arguments : [] })
                .send({ from : accounts[0], gas : '1000000' });
});

describe('Company', () => {
    it('deploys a contract', () => {
        assert.ok(company.options.address);
    });

    it('has same company address', async () => {
        const companyAddress = await company.methods.companyAddress().call();
        assert.equal(accounts[0], companyAddress);
    });

    describe('Claimed', () => {
        it('can be accessed by same user and adds a claim', async () =>{
            await company.methods.addClaim(accounts[2]).send({ from : accounts[0], gas : '1000000' });
            const userAddress = await company.methods.firstClaim().call();
            assert.equal(userAddress, accounts[2]);
        });
    
        it('can be accessed by same user and adds multiple claims', async () =>{
            await company.methods.addClaim(accounts[2]).send({ from : accounts[0], gas : '1000000' });
            await company.methods.addClaim(accounts[3]).send({ from : accounts[0], gas : '1000000' });
            await company.methods.addClaim(accounts[4]).send({ from : accounts[0], gas : '1000000' });
            
            userAddress = await company.methods.firstClaim().call();
            assert.equal(userAddress, accounts[2]);
            await company.methods.removeClaim().send({ from : accounts[0], gas : '1000000' });
    
            userAddress = await company.methods.firstClaim().call();
            assert.equal(userAddress, accounts[3]);
            await company.methods.removeClaim().send({ from : accounts[0], gas : '1000000' });
    
            userAddress = await company.methods.firstClaim().call();
            assert.equal(userAddress, accounts[4]);
            await company.methods.removeClaim().send({ from : accounts[0], gas : '1000000' });
        });
    
        it('can not be accessed by different user to add claims', async () => {
            try {
                await company.methods.addClaim(accounts[2]).send({ from : accounts[1], gas : '1000000' });
                assert(false);
            } catch (err) {
                assert(err);
            }
        });
    
        it('can not be accessed by different user to remove claims', async () => {
            try {
                await company.methods.addClaim(accounts[2]).send({ from : accounts[0], gas : '1000000' });
                await company.methods.removeClaim().send({ from : accounts[1], gas : '1000000' });
                assert(false);
            } catch (err) {
                assert(err);
            }
        });
    
        it('can not access empty queue', async () => {
            try {
                await company.methods.firstClaim().call();
                assert(false);
            } catch (err) {
                assert(err);
            }
        });
    });

    describe('Verified', () => {
        it('can be accessed by same user and adds a claim', async () =>{
            await company.methods.addVerifiedClaim(accounts[2]).send({ from : accounts[0], gas : '1000000' });
            const userAddress = await company.methods.firstVerifiedClaim().call();
            assert.equal(userAddress, accounts[2]);
        });
    
        it('can be accessed by same user and adds multiple claims', async () =>{
            await company.methods.addVerifiedClaim(accounts[2]).send({ from : accounts[0], gas : '1000000' });
            await company.methods.addVerifiedClaim(accounts[3]).send({ from : accounts[0], gas : '1000000' });
            await company.methods.addVerifiedClaim(accounts[4]).send({ from : accounts[0], gas : '1000000' });
            
            userAddress = await company.methods.firstVerifiedClaim().call();
            assert.equal(userAddress, accounts[2]);
            await company.methods.removeVerifiedClaim().send({ from : accounts[0], gas : '1000000' });
    
            userAddress = await company.methods.firstVerifiedClaim().call();
            assert.equal(userAddress, accounts[3]);
            await company.methods.removeVerifiedClaim().send({ from : accounts[0], gas : '1000000' });
    
            userAddress = await company.methods.firstVerifiedClaim().call();
            assert.equal(userAddress, accounts[4]);
            await company.methods.removeVerifiedClaim().send({ from : accounts[0], gas : '1000000' });
        });
    
        it('can not be accessed by different user to add claims', async () => {
            try {
                await company.methods.addVerifiedClaim(accounts[2]).send({ from : accounts[1], gas : '1000000' });
                assert(false);
            } catch (err) {
                assert(err);
            }
        });
    
        it('can not be accessed by different user to remove claims', async () => {
            try {
                await company.methods.addVerifiedClaim(accounts[2]).send({ from : accounts[0], gas : '1000000' });
                await company.methods.removeVerifiedClaim().send({ from : accounts[1], gas : '1000000' });
                assert(false);
            } catch (err) {
                assert(err);
            }
        });
    
        it('can not access empty queue', async () => {
            try {
                await company.methods.firstVerifiedClaim().call();
                assert(false);
            } catch (err) {
                assert(err);
            }
        });
    });
    
});

