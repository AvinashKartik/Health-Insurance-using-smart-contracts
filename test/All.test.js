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
                    .send({ from : accounts[0], gas : '1000000' });
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
        buyInsurance = async (user, address, dedeuctible, coinsurance) => {
            await user.methods.buyInsurance(address, dedeuctible, coinsurance).send({ from : accounts[0], gas : '1000000' });
        };
        await buyInsurance(user, company.options.address, 1000, 80);
        const insuranceBought = await user.methods.insuranceDetails().call();
        console.log("insurance bought : ", insuranceBought);

        claimInsurance = async (user, hospitalAddress, name, cause, amount) => {
            await user.methods.addClaim(hospitalAddress, name, cause, amount).send({ from : accounts[0], gas : '1000000' });
        };
        await claimInsurance(user, hospital.options.address, 'Sharvan', 'teeth', 2000);
        const insuranceClaimed = await user.methods.getClaim().call();
        console.log("insurance claimed : ", insuranceClaimed);

        sendInsuranceClaimToCompany = async (user) => {
            const insuranceBought = await user.methods.insuranceDetails().call();
            const companyOfUser = await new web3.eth.Contract(abiCompany, insuranceBought.companyAddress);
            await companyOfUser.methods.addClaim(user.options.address).send({ from : accounts[0], gas : '1000000' });
            assert.equal(companyOfUser.options.address, company.options.address);
        }
        await sendInsuranceClaimToCompany(user);
        console.log("Insurance sent to company");

        sendInsuranceClaimToHospital = async (company) => {
            const userAddress = await company.methods.firstClaim().call();
            const userOfClaim = await new web3.eth.Contract(abiUser, userAddress);
            const insuranceClaimed = await userOfClaim.methods.insuranceClaim().call();
            const hospitalOfUser = await new web3.eth.Contract(abiHospital, insuranceClaimed.hospitalAddress);
            await hospitalOfUser.methods.addClaim(userAddress).send({ from : accounts[0], gas : '1000000' });
            await company.methods.removeClaim().send({ from : accounts[0], gas : '1000000' });
            assert.equal(hospitalOfUser.options.address, hospital.options.address);
            assert.equal(userOfClaim.options.address, user.options.address);
        };
        await sendInsuranceClaimToHospital(company);
        console.log("Insurance sent to hospital");

        sendVerificationToCompany = async (hospital) => {
            const userAddress = await hospital.methods.firstClaim().call();
            const userOfClaim = await new web3.eth.Contract(abiUser, userAddress);
            const insuranceBought = await userOfClaim.methods.insuranceDetails().call();
            const companyOfUser = await new web3.eth.Contract(abiCompany, insuranceBought.companyAddress);
            await companyOfUser.methods.addVerifiedClaim(user.options.address).send({ from : accounts[0], gas : '1000000' });
            await hospital.methods.removeClaim().send({ from : accounts[0], gas : '1000000' });
            assert.equal(companyOfUser.options.address, company.options.address);
            assert.equal(userOfClaim.options.address, user.options.address);
        };
        await sendVerificationToCompany(hospital);
        console.log("Verification sent to company");

        sendVerificationToUser = async (company) => {
            const userAddress = await company.methods.firstVerifiedClaim().call();
            const userOfClaim = await new web3.eth.Contract(abiUser, userAddress);
            await userOfClaim.removeClaim().send({ from : accounts[0], gas : '1000000' });
            await company.methods.removeVerifiedClaim().send({ from : accounts[0], gas : '1000000' });
            assert.equal(userOfClaim.options.address, user.options.address);
        };
        await sendVerificationToUser(company);
        console.log("Verification sent to user");

        const check = await user.methods.claimed().call();
        assert.equal(check, false)
    });
});