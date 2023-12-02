document.addEventListener('DOMContentLoaded', function() {
    const apiKey = '3CTKXD9IQFXP2TEUK941FAR3QKUXST98HJ';
    const ethAddress = '0xa1b74d2280966a89ac7e0f3a8bc5f0867c776d98';
    const ethBalanceUrl = `https://api.etherscan.io/api?module=account&action=balance&address=${ethAddress}&tag=latest&apikey=${apiKey}`;
    const usdcBalanceUrl = `https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48&address=${ethAddress}&tag=latest&apikey=${apiKey}`;
    const cacheKey = 'ethUsdcBalance';
    const cachedData = JSON.parse(localStorage.getItem(cacheKey));

    // Function to display balance
    function displayBalance(totalInUsd) {
        totalInUsd = Math.round(totalInUsd);
        const formattedTotal = totalInUsd.toLocaleString('en-US');
        document.getElementById('totalBalance').textContent = `$${formattedTotal}`;
    }

    // Check if cached data is less than a day old
    if (cachedData && new Date().getTime() - cachedData.timestamp < 86400000) {
        displayBalance(cachedData.totalInUsd);
        return;
    }

    let totalInUsd = 0;

    // Fetch ETH balance and convert to USD
    fetch(ethBalanceUrl)
        .then(response => response.json())
        .then(data => {
            const ethBalance = parseInt(data.result) / 1e18; // Convert Wei to ETH
            return fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
                .then(res => res.json())
                .then(priceData => {
                    const ethToUsdRate = priceData.ethereum.usd;
                    return ethBalance * ethToUsdRate;
                });
        })
        .then(ethBalanceInUsd => {
            totalInUsd += ethBalanceInUsd;

            // Fetch USDC balance
            return fetch(usdcBalanceUrl);
        })
        .then(response => response.json())
        .then(data => {
            const usdcBalance = parseInt(data.result) / 1e6; // Convert smallest USDC unit to USDC
            totalInUsd += usdcBalance;

            // Cache and display the result
            localStorage.setItem(cacheKey, JSON.stringify({ totalInUsd, timestamp: new Date().getTime() }));
            displayBalance(totalInUsd);
        })
        .catch(error => console.error('Error fetching data:', error));
});