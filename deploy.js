// deploy code will go here
const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const compiler = require('./compile');
const { interface, bytecode } = compile.User;
const initMessage = 'Hello!';

const provider = new HDWalletProvider(
    'sponsor armor purchase ghost mobile urban bonus excuse farm silent wink bar',
    'https://rinkeby.infura.io/v3/a119733a6d19439c94d1131791fc9d4e'
);
const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    console.log('Attempting to deploy contract from ', accounts[0]);

    const inbox = await new web3.eth.Contract(JSON.parse(interface))
                .deploy({ data : bytecode, arguments : [initMessage] })
                .send({ from : accounts[0], gas : '1000000' });

    console.log('Deployed contract to ', inbox.options.address);
    provider.engine.stop(); // To prevent hanging deployment.
};
deploy();