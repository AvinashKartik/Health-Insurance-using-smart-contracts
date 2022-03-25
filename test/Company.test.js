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
                .send({ from : accounts[0], gas : '3000000' });
});

describe('Company', () => {
    it('deploys a contract', () => {
        assert.ok(company.options.address);
    });

    it('adding a claim', async () =>{
        await company.methods.addClaim('Aditya','Intestine lol',20000).send({ from : accounts[0], gas : '1000000' });
        const claimAdded = await company.methods.getRecentClaim().call();
        // console.log(claimAdded.patientName);
        assert.equal(claimAdded.patientName,'Aditya');
        assert.equal(claimAdded.reasonForHospitalization,'Intestine lol');
        assert.equal(claimAdded.amountPayable,'20000');
    });
});

