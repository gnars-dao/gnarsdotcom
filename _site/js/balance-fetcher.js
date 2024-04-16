document.addEventListener('DOMContentLoaded', function() {
    const apiKey = 'JAPCVP8VDFGKN6I9HVA371E2YHXQ5PARUQ';
    const ethAddress = '0x72ad986ebac0246d2b3c565ab2a1ce3a14ce6f88';
    const ethBalanceUrl = `https://api.basescan.org/api?module=account&action=balance&address=${ethAddress}&tag=latest&apikey=${apiKey}`;
    const usdcBalanceUrl = `https://api.basescan.org/api?module=account&action=tokenbalance&contractaddress=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&address=${ethAddress}&tag=latest&apikey=${apiKey}`;
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