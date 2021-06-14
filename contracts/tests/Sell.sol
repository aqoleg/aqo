// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.4;


// buy/sell token
contract Sell {
    uint256 public totalSupply; // totalSupply < 1e20

    // for testing send eth via selfdistruct()
    receive () external payable {
    }

    function balance() public view returns (uint256) {
        return address(this).balance;
    }

    // price = 1e58 / (1e20 - _total) ** 2
    function price() public view returns (uint256) {
        return 1e58 / (1e20 - totalSupply) ** 2;
    }

    // total = 1e20 - 1e40 / (_balance + 1e20)
    // total < 1e20
    function buy() public payable returns (uint256) {
        uint256 newTotalSupply = 1e20 - 1e40 / (address(this).balance + 1e20);
        uint256 tokens = newTotalSupply - totalSupply;
        totalSupply = newTotalSupply;
        return tokens;
    }

    // balance = 1e40 / (1e20 - _total) - 1e20
    function sell(uint256 _tokens) external returns (uint256) {
        totalSupply -= _tokens;
        uint256 value = address(this).balance - (1e40 / (1e20 - totalSupply) - 1e20);
        payable(msg.sender).transfer(value);
        return value;
    }
}

/*
   t      b      p
                       buy(1 eth) = 0.99
 0.99   1      1.02    buy(1 wei) = 0
 0.99   1      1.02    buy(3.88 eth) = 3.66
 4.65   4.88   1.1     buy(0) = 0
 4.65   4.88   1.1     sell(1) = 1 wei
 4.65   4.88   1.1     send(1 eth)
 4.65   5.88   1.1     sell(0) = 1
 4.65   4.88   1.1     send(1 eth)
 4.65   5.88   1.1     sell(3.65) = 4.87
 1      1.01   1.02    sell(0) = 0
 1      1.01   1.02    sell(1002936689549961862) = 1
 0      0      1       buy(4.88) = 4.65
 4.65   4.88   1.1     send(1 eth)
 4.65   5.88   1.1     buy(1) = 1.8
 6.4    6.88   1.14    send(1 eth)
 6.4    7.88   1.14    buy(0) = 0.9
 7.3    7.88   1.16    sell(6.3) = 6.8
 1      1      1.02
*/
