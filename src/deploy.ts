require('dotenv').config();
import Web3 from 'web3';
import HDWalletProvider from '@truffle/hdwallet-provider';
import { abi, evm } from '../build/compile';

const provider = new HDWalletProvider(
    process.env.MNEMONIC,
    'https://goerli.infura.io/v3/1b2db39c045e4489ab59eb05f236aeab'
);

const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    const result = await new web3.eth.Contract(abi)
        .deploy({ data: evm.bytecode.object })
        .send({ from: accounts[0], gas: 3000000 });
    
    console.log(`🚀 ~ deploy ~ attempting to deploy from account ${accounts[0]}`);
    console.log(`🚀 ~ deploy ~ contract address: ${result.options.address}`);
    
    provider.engine.stop();
}

deploy();