'use strict';
(function () {
    var ethAddress = '0x5D1d740df4bFdB5449b7E465333EF3767d505776';
    var abi = [
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "price",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "buy",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_tokens",
                    "type": "uint256"
                }
            ],
            "name": "sell",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ];

    var contract, account;

    window.onload = function () {
        document.getElementById('buy').onclick = function () {
            act(true);
        };
        document.getElementById('sell').onclick = function () {
            act(false);
        };
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/web3@latest/dist/web3.min.js';
        script.onload = function () {
            var user = 'aqo ';
            if (!window.ethereum) {
                user += 'no ethereum';
            } else {
                user += ethereum.isMetaMask ? 'metamask' : 'ethereum';
            }
            var language = null;
            if (typeof navigator.language === 'string') {
                language = navigator.language.substr(0, 2);
            }
            fetch('https://aqoleg.com/log', {
                method: 'POST',
                body: JSON.stringify({
                    user: user,
                    language: language,
                    timeZone: new Date().getTimezoneOffset() / (-60)
                })
            }).catch(console.log);
            window.web3 = new Web3(ethereum);
            if (ethereum.on) {
                ethereum.on('chainChanged', load);
                ethereum.on('accountsChanged', load);
            }
            var f;
            if (!ethereum.request) {
                f = ethereum.enable();
            } else {
                f = ethereum.request({method: 'eth_requestAccounts'});
            }
            f.then(function () {
                load();
            }).catch(console.log);
        }
        document.body.appendChild(script);
    }

    function load() {
        web3.eth.getChainId().then(function (network) {
            if (network != 1) {
                contract = null;
                return alert('switch to the main network');
            }
            contract = new web3.eth.Contract(abi, ethAddress);
            loadPrice();
            web3.eth.getAccounts().then(function (accounts) {
                if (accounts.length === 0) {
                    account = null;
                } else {
                    account = accounts[0];
                    var language = null;
                    if (typeof navigator.language === 'string') {
                        language = navigator.language.substr(0, 2);
                    }
                    fetch('https://aqoleg.com/log', {
                        method: 'POST',
                        body: JSON.stringify({
                            user: account,
                            language: language,
                            timeZone: new Date().getTimezoneOffset() / (-60)
                        })
                    }).catch(console.log);
                    loadBalance();
                }
            }).catch(console.log);
        }).catch(console.log);
    }

    function act(buy) {
        if (!window.ethereum) {
            return alert('ethereum is not supported');
        } else if (!account) {
            return ethereum.enable();
        }
        var value = new BigNumber(document.getElementById('value').value);
        if (value.isNaN()) {
            return alert('enter a number');
        } else if (value.isNegative() || value.isZero()) {
            document.getElementById('value').value = '1';
            return alert('enter a positive number');
        }
        var f;
        if (buy) {
            f = web3.eth.getBalance(account);
        } else {
            f = contract.methods.balanceOf(account).call();
        }
        f.then(function (balance) {
            balance = new BigNumber(balance).shiftedBy(-18);
            if (balance.isZero()) {
                return alert('zero balance');
            } else if (value.isGreaterThan(balance)) {
                document.getElementById('value').value = balance.toFixed(6, BigNumber.ROUND_FLOOR);
                return;
            }
            if (buy) {
                contract.methods.buy().send({
                    from: account,
                    value: value.shiftedBy(18)
                }).on('transactionHash', function (hash) {
                    window.open('https://etherscan.io/tx/' + hash);
                }).on('confirmation', function (confirmationNumber, receipt) {
                    if (confirmationNumber != 0) {
                        return;
                    }
                    if (!receipt.status) {
                        alert('rejected');
                    } else {
                        alert('confirmed');
                        loadBalance();
                        loadPrice();
                    }
                }).catch(console.log);
            } else {
                contract.methods.sell(value.shiftedBy(18).toFixed(0)).send({
                    from: account
                }).on('transactionHash', function (hash) {
                    window.open('https://etherscan.io/tx/' + hash);
                }).on('confirmation', function (confirmationNumber, receipt) {
                    if (confirmationNumber != 0) {
                        return;
                    }
                    if (!receipt.status) {
                        alert('rejected');
                    } else {
                        alert('confirmed');
                        loadBalance();
                        loadPrice();
                    }
                }).catch(console.log);
            }
        }).catch(console.log);
    }

    function loadPrice() {
        if (!contract) {
            return;
        }
        contract.methods.price().call().then(function (price) {
            price = new BigNumber(price).shiftedBy(-18);
            printValue(price, document.getElementById('price'));
        }).catch(console.log);
    }

    function loadBalance() {
        if (!contract || !account) {
            return;
        }
        contract.methods.balanceOf(account).call().then(function (balance) {
            balance = new BigNumber(balance).shiftedBy(-18);
            printValue(balance, document.getElementById('balance'));
        }).catch(console.log);
    }


    function printValue(value, element) {
        if (value.isZero()) {
            element.title = '';
            element.innerHTML = '0';
        } else {
            element.title = value.toFixed(18);
            if (value.isGreaterThan(0.001)) {
                element.innerHTML = value.toFixed(3, BigNumber.ROUND_DOWN);
            } else if (value.isGreaterThan(0.000001)) {
                element.innerHTML = value.toFixed(6, BigNumber.ROUND_DOWN);
            } else {
                element.innerHTML = value.toExponential(3, BigNumber.ROUND_DOWN);
            }
        }
    }
})();