// compile code will go here
const path = require('path');
const fs = require('fs');
const solc = require('solc');

const userPath = path.resolve(__dirname, 'contracts', 'User.sol');
const userSource = fs.readFileSync(userPath, 'utf8');
const companyPath = path.resolve(__dirname, 'contracts', 'Company.sol');
const companySource = fs.readFileSync(companyPath, 'utf8');

var input = {
    language: 'Solidity',
    sources: {
        'User.sol' : {
            content: userSource
        },
        'Company.sol' : {
            content: companySource
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': [ '*' ]
            }
        }
    }
}; 

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const user = output.contracts['User.sol'].User;
const company = output.contracts['Company.sol'].Company;

exports.getUser = () => {
    return user;
}

exports.getCompany = () => {
    return company;
}