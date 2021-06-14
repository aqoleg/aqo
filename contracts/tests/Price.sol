// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.4;


// price function
contract Price {
    // t - total supply, aqo, 0 <= t < 100
    // p - price, eth/aqo, p >= 1
    // b - contract balance, eth, b >= 0

    // p = 10000 / (100 - t)^2
    function price(uint256 _total) public pure returns (uint256) {
        require(_total < 1e20, "too big");
        return 1e58 / (1e20 - _total) ** 2;
    }

    // b = integral p(t) dt
    // b = 10000 / (100 - t) - 100
    function balance(uint256 _total) public pure returns (uint256) {
        require(_total < 1e20, "too big");
        return 1e40 / (1e20 - _total) - 1e20;
    }

    // t = 100 - 10000 / (b + 100)
    function total(uint256 _balance) public pure returns (uint256) {
        return 1e20 - 1e40 / (_balance + 1e20);
    }
}

/*
   t      b      p
 0      0      1
 0.1    0.1    1
 0.5    0.5    1.01
 1      1      1.02
 4.65   4.88   1.1
 18.36  22.5   1.5
 29.3   41.4   2
 42.3   73.3   3
 60     150    6.25
 80     400    25
 90.9   999    120.8
 99     9900   10000
*/
