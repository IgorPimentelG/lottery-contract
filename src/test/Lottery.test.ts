
import * as assert from 'assert';
import * as ganache from 'ganache-cli';
import Web3 from 'web3';
import { abi, evm } from '../../build/compile.js';
import { Contract } from "web3-eth-contract";

let accounts: string[];
let lottery: Contract;
const web3 = new Web3(ganache.provider());

describe('Lottery', () => {
    beforeEach(async () => {
        accounts = await web3.eth.getAccounts();
        lottery = await new web3.eth.Contract(abi)
            .deploy({ data: evm.bytecode.object })
            .send({ from: accounts[0], gas: 3000000 });
    });

    it('Should deploy the contract', async () => {
       assert.ok(lottery.options.address);
    });

    it('Should allows multiple account to enter in the game', async () => {
        const playerName = 'Any Name';
        await lottery.methods.enter(playerName).send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        });
        await lottery.methods.enter(playerName).send({
            from: accounts[2],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(2, players.length);
        assert.equal(players[0].name, playerName);
        assert.equal(players[0].wallet, accounts[1]);
        assert.equal(players[1].name, playerName);
        assert.equal(players[1].wallet, accounts[2]);
    });

    it('Should requires a minimum amount of ether to enter in the game', async () => {
        try {
            await lottery.methods.enter('Any Name').send({
                from: accounts[1],
                value: 0
            });
            assert.ok(false);
        } catch (error) {
            assert.ok(error);
        }
    });

    it('Should only manager can call pickWinner', async () => {
        try {
            await lottery.methods.pickWinner().send({ from: accounts[1] });
            assert.ok(false);
        } catch (error) {
            assert.ok(error);
        }
    });

    it('Should sends money to the winner and resets the players', async () => {
        await lottery.methods.enter('Any Name').send({
            from: accounts[1],
            value: web3.utils.toWei('2', 'ether')
        });

        const initialPlayers = await lottery.methods.getPlayers().call({ from: accounts[0] });
        const initialBalance = await web3.eth.getBalance(accounts[1]);

        await lottery.methods.pickWinner().send({ from: accounts[0] });

        const finalBalance = await web3.eth.getBalance(accounts[1]);
        const finalPlayers = await lottery.methods.getPlayers().call({ from: accounts[0] });
        const difference = Number(finalBalance) - Number(initialBalance);
        assert.ok(difference > Number(web3.utils.toWei('1.8', 'ether')));
        assert.equal(initialPlayers.length, 1);
        assert.equal(finalPlayers.length, 0);
    });
});