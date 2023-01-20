import * as fs from 'fs';
import * as path from 'path';
import * as solc from 'solc';

const lotteryPath = path.resolve('src', 'contracts', 'Lottery.sol');
const source = fs.readFileSync(lotteryPath, 'utf8');

const input = {
    language: 'Solidity',
    sources: {
        'Lottery.sol': {
            content: source
        }
    }, 
    settings: {
        outputSelection: {
            '*': {
                '*': ['*']
            }
        }
    }
};

module.exports = JSON.parse(solc.compile(JSON.stringify(input)))
    .contracts['Lottery.sol'].Lottery;

