"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const web3_1 = __importDefault(require("web3"));
const hdwallet_provider_1 = __importDefault(require("@truffle/hdwallet-provider"));
const compile_1 = require("../build/compile");
const provider = new hdwallet_provider_1.default(process.env.MNEMONIC, 'https://goerli.infura.io/v3/1b2db39c045e4489ab59eb05f236aeab');
const web3 = new web3_1.default(provider);
const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    const result = await new web3.eth.Contract(compile_1.abi)
        .deploy({ data: compile_1.evm.bytecode.object })
        .send({ from: accounts[0], gas: 3000000 });
    console.log(`🚀 ~ deploy ~ attempting to deploy from account ${accounts[0]}`);
    console.log(`🚀 ~ deploy ~ contract address: ${result.options.address}`);
    provider.engine.stop();
};
deploy();
