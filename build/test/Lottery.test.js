"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const ganache = __importStar(require("ganache-cli"));
const web3_1 = __importDefault(require("web3"));
const compile_js_1 = require("../../build/compile.js");
let accounts;
let lottery;
const web3 = new web3_1.default(ganache.provider());
describe('Lottery', () => {
    beforeEach(async () => {
        accounts = await web3.eth.getAccounts();
        lottery = await new web3.eth.Contract(compile_js_1.abi)
            .deploy({ data: compile_js_1.evm.bytecode.object })
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
        }
        catch (error) {
            assert.ok(error);
        }
    });
    it('Should only manager can call pickWinner', async () => {
        try {
            await lottery.methods.pickWinner().send({ from: accounts[1] });
            assert.ok(false);
        }
        catch (error) {
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
