var Aqo = (function () {
    "use strict";

    var abi = [{
        name: "totalSupply",
        type: "function",
        constant: true,
        inputs: [],
        outputs: [{name: "", type: "uint256"}]
    }, {
        name: "name",
        type: "function",
        constant: true,
        inputs: [],
        outputs: [{name: "", type: "string"}]
    }, {
        name: "symbol",
        type: "function",
        constant: true,
        inputs: [],
        outputs: [{name: "", type: "string"}]
    }, {
        name: "balanceOf",
        type: "function",
        constant: true,
        inputs: [{name: "", type: "address"}],
        outputs: [{name: "", type: "uint256"}]
    }, {
        name: "allowance",
        type: "function",
        constant: true,
        inputs: [{name: "from", type: "address"}, {name: "to", type: "address"}],
        outputs: [{name: "", type: "uint256"}]
    }, {
        name: "transfer",
        type: "function",
        inputs: [{name: "_to", type: "address"}, {name: "_value", type: "uint256"}],
        outputs: [{name: "", type: "bool"}]
    }, {
        name: "transferFrom",
        type: "function",
        inputs: [{name: "_from", type: "address"}, {name: "_to", type: "address"}, {name: "_value", type: "uint256"}],
        outputs: [{name: "", type: "bool"}]
    }, {
        name: "approve",
        type: "function",
        inputs: [{name: "_spender", type: "address"}, {name: "_value", type: "uint256"}],
        outputs: [{name: "", type: "bool"}]
    }];
    var network; // current network
    var mainContractAddress = "0x9f0afda1f2b46a4E0829804409Cb11C90ACCC7eE";
    var testContractAddress = "0xfD338dEAdD6BE6De042BBd19FF2F4043BE924286";
    var contractAddress; // current contract address
    var contract;
    var login = true;
    var tokenBalance = null; // BigNumber in AQO
    var ethBalance = null; // BigNumber in ETH
    var price = 2; // gas price in GWEI (ETH*10^-9)

    window.addEventListener("load", async () => {
        if (window.ethereum) {
            window.web3 = new Web3(ethereum);
            try {
                await ethereum.enable();
                load();
                setInterval(load, 5000);
            } catch (error) {
                alert("Can not proceed. Account access was denied.");
            }
        } else if (window.web3) {
            window.web3 = new Web3(web3.currentProvider);
            load();
            setInterval(load, 5000);
        } else {
            alert("Can not proceed. Non-ethereum browser detected.");
        }
    });

    function load() {
        web3.version.getNetwork(function (error, result) {
            if (!error) {
                if (network !== result) {
                    network = result;
                    if (network == 1) { // main
                        contractAddress = mainContractAddress;
                        contract = web3.eth.contract(abi).at(contractAddress);
                        setAddress(true);
                        checkLogin();
                    } else if (network == 3) { // ropsten
                        contractAddress = testContractAddress;
                        contract = web3.eth.contract(abi).at(contractAddress);
                        setAddress(false);
                        checkLogin();
                    } else {
                        setAddress(true);
                        alert("Switch to main network or ropsten test network!");
                    }
                } else if (network == 1 || network == 3) {
                    checkLogin();
                }
            }
        });
        function setAddress(main) {
            var a = document.getElementById("contract");
            if (main) {
                a.innerHTML = mainContractAddress;
                a.href = "https://etherscan.io/address/".concat(mainContractAddress);
            } else {
                a.innerHTML = testContractAddress;
                a.href = "https://ropsten.etherscan.io/address/".concat(testContractAddress);
            }
        }
        function checkLogin() {
            web3.eth.getAccounts(function (error, result) {
                if (!error) {
                    if (result.length === 0) {
                        if (login) {
                            login = false;
                            alert("Login!");
                        }
                    } else {
                        login = true;
                    }
                    getInfo();
                }
            });
        }
        function getInfo() {
            contract.name(function (error, result) {
                if (!error) {
                    document.getElementById("name").innerHTML = result;
                }
            });
            contract.symbol(function (error, result) {
                if (!error) {
                    document.getElementById("symbol").innerHTML = result;
                }
            });
            contract.totalSupply(function (error, result) {
                if (!error) {
                    document.getElementById("totalSupply").innerHTML = result.shift(-18).toFixed();
                }
            });
            if (login) {
                document.getElementById("yourAddress").innerHTML = web3.eth.defaultAccount;
                contract.balanceOf(web3.eth.defaultAccount, function (error, result) {
                    if (!error) {
                        tokenBalance = result.shift(-18);
                        document.getElementById("yourTokens").innerHTML = tokenBalance.toFixed();
                        if (tokenBalance !== null && ethBalance !== null) {
                            document.getElementById("yourEntire").innerHTML = tokenBalance.plus(ethBalance).toFixed();
                        }
                    }
                });
                web3.eth.getBalance(web3.eth.defaultAccount, function (error, result) {
                    if (!error) {
                        ethBalance = result.shift(-18);
                        document.getElementById("yourEth").innerHTML = ethBalance.toFixed();
                        if (tokenBalance !== null && ethBalance !== null) {
                            document.getElementById("yourEntire").innerHTML = tokenBalance.plus(ethBalance).toFixed();
                        }
                    }
                });
            }
        }
    }

    function check(requireLogin) {
        if (network != 1 && network != 3) {
            alert("Switch to main network or ropsten test network!");
            return false;
        }
        if (requireLogin && !login) {
            alert("Login!");
            return false;
        }
        return true;
    }

    function checkToken() {
        if (!check(false)) {
            return;
        }
        var address = document.getElementById("checkTokenAddress").value;
        if (!web3.isAddress(address)) {
            alert("Enter valid address");
        } else {
            contract.balanceOf(address, function (error, result) {
                if (!error) {
                    document.getElementById("checkTokenOutput").innerHTML = result.shift(-18).toFixed();
                }
            });
        }
    }

    function checkAllowance() {
        if (!check(false)) {
            return;
        }
        var sourceAddress = document.getElementById("checkAllowanceSourceAddress").value;
        var spenderAddress = document.getElementById("checkAllowanceSpenderAddress").value;
        if (!web3.isAddress(sourceAddress)) {
            alert("Enter valid source address");
        } else if (!web3.isAddress(spenderAddress)) {
            alert("Enter valid spender address");
        } else {
            contract.allowance(sourceAddress, spenderAddress, function (error, result) {
                if (!error) {
                    document.getElementById("checkAllowanceOutput").innerHTML = result.shift(-18).toFixed();
                }
            });
        }
    }

    function transfer() {
        if (!check(true)) {
            return;
        }
        var address = document.getElementById("transferAddress").value;
        var value = document.getElementById("transferValue").value;
        if (!web3.isAddress(address)) {
            alert("Enter valid address");
        } else {
            try {
                value = web3.toBigNumber(value);
            } catch (error) {
                alert("Enter number");
                return;
            }
            if (!value.gt(0)) {
                alert("Enter positive number");
            } else if (value.gt(tokenBalance)) {
                alert("Not enough token balance. Balance: " + tokenBalance.toFixed() + " AQO.");
            } else {
                contract.transfer(
                    address,
                    value.shift(18),
                    {"gasPrice": web3.toBigNumber(price).shift(9).toFixed()},
                    function (error, result) {
                        if (!error && result) {
                            alert("OK");
                        }
                    }
                );
            }
        }
    }

    function transferFrom() {
        if (!check(true)) {
            return;
        }
        var fromAddress = document.getElementById("transferFromAddress").value;
        var toAddress = document.getElementById("transferToAddress").value;
        var value = document.getElementById("transferFromValue").value;
        if (!web3.isAddress(fromAddress)) {
            alert("Enter valid source address");
        } else if (!web3.isAddress(toAddress)) {
            alert("Enter valid recipient address");
        } else {
            try {
                value = web3.toBigNumber(value);
            } catch (error) {
                alert("Enter number");
                return;
            }
            if (!value.gt(0)) {
                alert("Enter positive number");
            } else {
                viewBalance();
            }
        }
        function viewBalance() {
            contract.balanceOf(fromAddress, function (error, result) {
                if (!error) {
                    result = result.shift(-18);
                    if (value.gt(result)) {
                        alert("Not enough token balance. Balance: " + result.toFixed() + " AQO." );
                    } else {
                        viewAllowance();
                    }
                }
            });
        }
        function viewAllowance() {
            contract.allowance(fromAddress, web3.eth.defaultAccount, function (error, result) {
                if (!error) {
                    result = result.shift(-18);
                    if (value.gt(result)) {
                        alert("Value is too big. Allowance: " + result.toFixed() + " AQO.");
                    } else {
                        createTransfer();
                    }
                }
            });
        }
        function createTransfer() {
            contract.transferFrom(
                fromAddress,
                toAddress,
                value.shift(18),
                {"gasPrice": web3.toBigNumber(price).shift(9).toFixed()},
                function (error, result) {
                    if (!error && result) {
                        alert("OK");
                    }
                }
            );
        }
    }

    function approve() {
        if (!check(true)) {
            return;
        }
        var address = document.getElementById("approveAddress").value;
        var value = document.getElementById("approveValue").value;
        if (!web3.isAddress(address)) {
            alert("Enter valid address");
        } else {
            try {
                value = web3.toBigNumber(value);
            } catch (error) {
                alert("Enter number");
                return;
            }
            if (value.lt(0)) {
                alert("Enter non-negative number");
            } else {
                contract.approve(
                    address,
                    value.shift(18),
                    {"gasPrice": web3.toBigNumber(price).shift(9).toFixed()},
                    function (error, result) {
                        if (!error && result) {
                            alert("OK");
                        }
                    }
                );
            }
        }
    }

    function buy() {
        if (!check(true)) {
            return;
        }
        var value = document.getElementById("buyValue").value;
        try {
            value = web3.toBigNumber(value);
        } catch (error) {
            alert("Enter number");
            return;
        }
        if (!value.gt(0)) {
            alert("Enter positive number");
        } else if (value.gt(ethBalance)) {
            alert("Not enough ETH balance. Your balance: " + ethBalance.toFixed() + " ETH.");
        } else {
            web3.eth.sendTransaction(
                {
                    "to": contractAddress,
                    "value": value.shift(18).toFixed(),
                    "gasPrice": web3.toBigNumber(price).shift(9).toFixed()
                },
                function (error, result) {
                    if (!error && result) {
                        alert("OK");
                    }
                }
            );
        }
    }

    function sell() {
        if (!check(true)) {
            return;
        }
        var value = document.getElementById("sellValue").value;
        try {
            value = web3.toBigNumber(value);
        } catch (error) {
            alert("Enter number");
            return;
        }
        if (!value.gt(0)) {
            alert("Enter positive number");
        } else if (value.gt(tokenBalance)) {
            alert("Not enough token balance. Balance: " + tokenBalance.toFixed() + " AQO.");
        } else {
            contract.transfer(
                contractAddress,
                value.shift(18),
                {"gasPrice": web3.toBigNumber(price).shift(9).toFixed()},
                function (error, result) {
                    if (!error && result) {
                        alert("OK");
                    }
                }
            );
        }
    }

    return {
        checkToken: function () {
            checkToken();
        },
        checkAllowance: function () {
            checkAllowance();
        },
        setPrice: function() {
            price = document.getElementById("gasPrice").value;
            document.getElementById("gasPriceValue").innerHTML = price;
        },
        transfer: function () {
            transfer();
        },
        transferFrom: function () {
            transferFrom();
        },
        approve: function () {
            approve();
        },
        buy: function () {
            buy();
        },
        sell: function () {
            sell();
        }
    };
})();
