// SPDX-License-Identifier: Unlincense
pragma solidity ^0.8.17;

contract Lottery {

    struct Player {
        string name;
        address payable wallet;
    }

    address public manager;
    Player[] public players;
    uint private randNonce = 0;

    constructor() {
       manager = msg.sender;
    }

    function findPlayer() private view returns (bool) {
        for (uint i = 0; i < players.length; i++) {
            if (players[i].wallet == msg.sender) {
                return true;
            }
        }
        return false;
    }

    function random() private view returns (uint) {
        require(players.length > 0, "There are no players!");
        address[] memory _players = new address[](players.length);
        for (uint i = 0; i < players.length; i++) {
            _players[i] = players[i].wallet;
        }
        uint randomNumber = uint(keccak256(abi.encode(block.timestamp, block.difficulty, _players)));
        return randomNumber % players.length;
    } 

    function enter(string memory _name) public payable {
        require(findPlayer() == false);
        require(msg.value > .01 ether);
        players.push(Player(_name, payable(msg.sender))); 
    }

    function pickWinner() public restricted {
        uint index = random();
        players[index].wallet.transfer(address(this).balance);
        delete players;
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function getPlayers() public view returns (Player[] memory) {
        return players;
    }

    modifier restricted() {
        require(msg.sender == manager, "Admin only");
        _;
    }
}