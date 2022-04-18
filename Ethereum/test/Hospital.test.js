// contract test code will go here
const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const compiler = require('../compile');
const { abi, evm } = compiler.getHospital();

let accounts, hospital;

beforeEach(async () => {
    accounts = await new web3.eth.getAccounts();
    hospital = await new web3.eth.Contract(abi)
                .deploy({ data : evm.bytecode.object, arguments : [] })
                .send({ from : accounts[0], gas : '1000000' });
});

describe('Hospital', () => {
    it('deploys a contract', () => {
        assert.ok(hospital.options.address);
    });

    it('has same hospital address', async () => {
        const hospitalAddress = await hospital.methods.hospitalAddress().call();
        assert.equal(accounts[0], hospitalAddress);
    });

    it('can be accessed by same user and adds a claim', async () =>{
        await hospital.methods.addClaim(accounts[2]).send({ from : accounts[0], gas : '1000000' });
        const userAddress = await hospital.methods.firstClaim().call();
        assert.equal(userAddress, accounts[2]);
    });

    it('can be accessed by same user and adds multiple claims', async () =>{
        await hospital.methods.addClaim(accounts[2]).send({ from : accounts[0], gas : '1000000' });
        await hospital.methods.addClaim(accounts[3]).send({ from : accounts[0], gas : '1000000' });
        await hospital.methods.addClaim(accounts[4]).send({ from : accounts[0], gas : '1000000' });
        
        userAddress = await hospital.methods.firstClaim().call();
        assert.equal(userAddress, accounts[2]);
        await hospital.methods.removeClaim().send({ from : accounts[0], gas : '1000000' });

        userAddress = await hospital.methods.firstClaim().call();
        assert.equal(userAddress, accounts[3]);
        await hospital.methods.removeClaim().send({ from : accounts[0], gas : '1000000' });

        userAddress = await hospital.methods.firstClaim().call();
        assert.equal(userAddress, accounts[4]);
        await hospital.methods.removeClaim().send({ from : accounts[0], gas : '1000000' });
    });

    it('can not be accessed by different user to add claims', async () => {
        try {
            await hospital.methods.addClaim(accounts[2]).send({ from : accounts[1], gas : '1000000' });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('can not be accessed by different user to remove claims', async () => {
        try {
            await hospital.methods.addClaim(accounts[2]).send({ from : accounts[0], gas : '1000000' });
            await hospital.methods.removeClaim().send({ from : accounts[1], gas : '1000000' });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('can not access empty queue', async () => {
        try {
            await hospital.methods.firstClaim().call();
            assert(false);
        } catch (err) {
            assert(err);
        }
    });
});

