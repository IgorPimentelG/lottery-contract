"use strict";
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
var solc = require("solc");
var lotteryPath = path.resolve('src', 'contracts', 'Lottery.sol');
var source = fs.readFileSync(lotteryPath, 'utf8');
var input = {
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
