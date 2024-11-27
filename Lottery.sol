// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;


contract Lottery {
    address public manager;
    address payable[] public participants;

    constructor() {
        manager = msg.sender;
    }

    function enter() public payable {
        require(msg.value > .01 ether, "Minimum amount to enter is 0.01 ETH");

        participants.push(payable(msg.sender));
    }

    function getParticipants() public view returns (address payable[] memory) {
        return participants;
    }

    function pickWinner() public restricted {
        uint index = random() % participants.length;
        participants[index].transfer(address(this).balance);

        // Reset the lottery for the next round
        participants = new address payable[](0);
    }

    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, participants)));
    }

    modifier restricted() {
        require(msg.sender == manager, "Only manager can call this function");
        _;
    }
}
