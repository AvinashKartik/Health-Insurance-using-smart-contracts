// contract test code will go here
const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const compiler = require('../compile');

const abiUser = compiler.getUser().abi;
const evmUser = compiler.getUser().evm;
const abiCompany = compiler.getCompany().abi;
const evmCompany = compiler.getCompany().evm;
const abiHospital = compiler.getHospital().abi;
const evmHospital = compiler.getHospital().evm;

let accounts, user, company, hospital;

beforeEach(async () => {
    accounts = await new web3.eth.getAccounts();
    user = await new web3.eth.Contract(abiUser)
                    .deploy({ data : evmUser.bytecode.object, arguments : [] })
                    .send({ from : accounts[0], gas : '3000000' });
    company = await new web3.eth.Contract(abiCompany)
                    .deploy({ data : evmCompany.bytecode.object, arguments : [] })
                    .send({ from : accounts[0], gas : '1000000' });
    hospital = await new web3.eth.Contract(abiHospital)
                    .deploy({ data : evmHospital.bytecode.object, arguments : [] })
                    .send({ from : accounts[0], gas : '1000000' });
});

describe('Integration', () => {
    it('can deploy all contracts', () => {
        assert.ok(user.options.address);
        assert.ok(company.options.address);
        assert.ok(hospital.options.address);
    });

    it('can claim insurance', async () => {
        await user.methods.buyInsurance(company.options.address, 1000, 80).send({ from : accounts[0], gas : '1000000' });
        const insuranceBought = await user.methods.insuranceDetails().call();

        // await company.methods.addClaim(user.address).send({ from : accounts[0], gas : '1000000' });
    });
});