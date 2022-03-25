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

    it('has same company address', async () => {
        const companyAddress = await company.methods.companyAddress().call();
        assert.equal(accounts[0], companyAddress);
    });

    it('can be accessed by same user and adds a claim', async () =>{
        await company.methods.addClaim('Aditya', 'Intestine', 20000).send({ from : accounts[0], gas : '1000000' });
        const claimAdded = await company.methods.firstClaim().call();
        assert.equal(claimAdded.patientName,'Aditya');
        assert.equal(claimAdded.reasonForHospitalization,'Intestine');
        assert.equal(claimAdded.amountPayable,'20000');
    });

    it('can be accessed by same user and adds multiple claims', async () =>{
        await company.methods.addClaim('Aditya', 'Intestine', 20000).send({ from : accounts[0], gas : '1000000' });
        await company.methods.addClaim('Avinash', 'Stomach', 2000).send({ from : accounts[0], gas : '1000000' });
        await company.methods.addClaim('Sharvan', 'Skin', 200000).send({ from : accounts[0], gas : '1000000' });
        
        claimAdded = await company.methods.firstClaim().call();
        assert.equal(claimAdded.patientName,'Aditya');
        assert.equal(claimAdded.reasonForHospitalization,'Intestine');
        assert.equal(claimAdded.amountPayable,'20000');
        await company.methods.removeClaim().send({ from : accounts[0], gas : '1000000' });

        claimAdded = await company.methods.firstClaim().call();
        assert.equal(claimAdded.patientName,'Avinash');
        assert.equal(claimAdded.reasonForHospitalization,'Stomach');
        assert.equal(claimAdded.amountPayable,'2000');
        await company.methods.removeClaim().send({ from : accounts[0], gas : '1000000' });

        claimAdded = await company.methods.firstClaim().call();
        assert.equal(claimAdded.patientName,'Sharvan');
        assert.equal(claimAdded.reasonForHospitalization,'Skin');
        assert.equal(claimAdded.amountPayable,'200000');
        await company.methods.removeClaim().send({ from : accounts[0], gas : '1000000' });
    });

    it('can not be accessed by different user', async () => {
        try {
            await company.methods.addClaim('Aditya', 'Intestine', 20000).send({ from : accounts[1], gas : '1000000' });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('can not access empty queue(claimed)', async () => {
        try {
            await company.methods.firstClaim().call();
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('can not access empty queue(verified)', async () => {
        try {
            await company.methods.firstVerifiedClaim().call();
            assert(false);
        } catch (err) {
            assert(err);
        }
    });
});

