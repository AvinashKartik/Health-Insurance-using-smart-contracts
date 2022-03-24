// contract test code will go here
const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const compiler = require('../compile');
const { abi, evm } = compiler.getUser();

let accounts, user;

beforeEach(async () => {
    accounts = await new web3.eth.getAccounts();
    user = await new web3.eth.Contract(abi)
                .deploy({ data : evm.bytecode.object, arguments : [] })
                .send({ from : accounts[0], gas : '1000000' });
});

describe('User', () => {
    it('deploys a contract', () => {
        assert.ok(user.options.address);
    });

    it('has same user address', async () => {
        const userAddress = await user.methods.userAddress().call();
        assert.equal(accounts[0], userAddress);
    });

    it('can be accessed by same user', async () => {
        await user.methods.buyInsurance(accounts[1], 1000, 80).send({ from : accounts[0], gas : '1000000' });
        const insuranceBought = await user.methods.insuranceDetails().call();

        assert.equal(insuranceBought.isActive, true);
        assert.equal(insuranceBought.companyAddress, accounts[1]);
        assert.equal(insuranceBought.deductible, 1000);
        assert.equal(insuranceBought.coinsurance, 80);
    });

    it('can not be access by a different user', async () => {
        try {
            await user.methods.buyInsurance(accounts[1], 1000, 80).send({ from : accounts[1], gas : '1000000' });
            assert(false);
        } catch(err) {
            assert(err);
        }
    });
});

