// deploy code will go here
const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const compiler = require('./compile');
const abiUser = compiler.getUser().abi;
const evmUser = compiler.getUser().evm;
const abiCompany = compiler.getCompany().abi;
const evmCompany = compiler.getCompany().evm;
const abiHospital = compiler.getHospital().abi;
const evmHospital = compiler.getHospital().evm;

const provider = new HDWalletProvider(
    'sponsor armor purchase ghost mobile urban bonus excuse farm silent wink bar',
    'https://rinkeby.infura.io/v3/a119733a6d19439c94d1131791fc9d4e'
);
const web3 = new Web3(provider);

let accounts, user, company, hospital;

const deploy = async () => {
    accounts = await web3.eth.getAccounts();

    console.log('Attempting to deploy contracts from ', accounts[0]);

    user = await new web3.eth.Contract(abiUser)
                    .deploy({ data : evmUser.bytecode.object, arguments : [] })
                    .send({ from : accounts[0], gas : '1000000' });
    company = await new web3.eth.Contract(abiCompany)
                    .deploy({ data : evmCompany.bytecode.object, arguments : [] })
                    .send({ from : accounts[0], gas : '1000000' });
    hospital = await new web3.eth.Contract(abiHospital)
                    .deploy({ data : evmHospital.bytecode.object, arguments : [] })
                    .send({ from : accounts[0], gas : '1000000' });;

    console.log('Deployed user contract to ', user.options.address);
    console.log('Deployed company contract to ', company.options.address);
    console.log('Deployed hospital contract to ', hospital.options.address);
    provider.engine.stop(); // To prevent hanging deployment.
};

const transaction = async () => {
    await deploy();
    const buyInsurance = async (user, address, dedeuctible, coinsurance) => {
        await user.methods.buyInsurance(address, dedeuctible, coinsurance).send({ from : accounts[0], gas : '1000000' });
    };
    await buyInsurance(user, company.options.address, 1000, 80);
    console.log("Insurance bought");

    const claimInsurance = async (user, hospitalAddress, name, cause, amount) => {
        hash = await user.methods.addClaim(hospitalAddress, name, cause, amount).send({ from : accounts[0], gas : '1000000' });
        console.log(hash.transactionHash);
    };
    await claimInsurance(user, hospital.options.address, 'Sharvan', 'teeth', 2000);
    console.log("Insurance claimed");

    const sendInsuranceClaimToCompany = async (user) => {
        const insuranceBought = await user.methods.insuranceDetails().call();
        const companyOfUser = await new web3.eth.Contract(abiCompany, insuranceBought.companyAddress);
        hash = await companyOfUser.methods.addClaim(user.options.address).send({ from : accounts[0], gas : '1000000' });
        console.log(hash.transactionHash);
    }
    await sendInsuranceClaimToCompany(user);
    console.log("Insurance sent to company");

    const sendInsuranceClaimToHospital = async (company) => {
        const userAddress = await company.methods.firstClaim().call();
        const userOfClaim = await new web3.eth.Contract(abiUser, userAddress);
        const insuranceClaimed = await userOfClaim.methods.insuranceClaim().call();
        const hospitalOfUser = await new web3.eth.Contract(abiHospital, insuranceClaimed.hospitalAddress);
        hash = await hospitalOfUser.methods.addClaim(userAddress).send({ from : accounts[0], gas : '1000000' });
        console.log(hash.transactionHash);
        hash = await company.methods.removeClaim().send({ from : accounts[0], gas : '1000000' });
        console.log(hash.transactionHash);
    };
    await sendInsuranceClaimToHospital(company);
    console.log("Insurance sent to hospital");

    const sendVerificationToCompany = async (hospital) => {
        const userAddress = await hospital.methods.firstClaim().call();
        const userOfClaim = await new web3.eth.Contract(abiUser, userAddress);
        const insuranceBought = await userOfClaim.methods.insuranceDetails().call();
        const companyOfUser = await new web3.eth.Contract(abiCompany, insuranceBought.companyAddress);
        hash = await companyOfUser.methods.addVerifiedClaim(user.options.address).send({ from : accounts[0], gas : '1000000' });
        console.log(hash.transactionHash);
        hash = await hospital.methods.removeClaim().send({ from : accounts[0], gas : '1000000' });
        console.log(hash.transactionHash);
    };
    await sendVerificationToCompany(hospital);
    console.log("Verification sent to company");

    const sendVerificationToUser = async (company) => {
        const userAddress = await company.methods.firstVerifiedClaim().call();
        const userOfClaim = await new web3.eth.Contract(abiUser, userAddress);
        hash =  await userOfClaim.methods.removeClaim().send({ from : accounts[0], gas : '1000000' });
        console.log(hash.transactionHash);
        hash = await company.methods.removeVerifiedClaim().send({ from : accounts[0], gas : '1000000' });
        console.log(hash.transactionHash);
    };
    await sendVerificationToUser(company);
    console.log("Verification sent to user");

}
transaction();