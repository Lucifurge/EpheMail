document.getElementById('createAccountBtn').addEventListener('click', async function () {
    try {
        // Display the loading message
        displayMessage('Creating account...', 'info');

        // Call the backend API to get account info
        const response = await axios.post('https://eppheapi-production.up.railway.app/create-account'); // Updated to your production URL
        console.log(response.data);  // Log the response to inspect the structure

        // Ensure response contains an address and extract domain
        const domain = response.data.address.split('@')[1];  // Extract domain from email address

        if (!domain) {
            displayMessage('Domain not found!', 'error');
            return;
        }

        console.log('Available Domain:', domain);

        // Generate random credentials using the extracted domain
        const { username, password } = generateRandomCredentials(domain);
        const address = `${username}@${domain}`;

        // Create the account
        const account = { address, password };

        // Display the account in a new box
        displayAccount(account);
    } catch (error) {
        console.error('Error in main process:', error.message);
        displayMessage('Error occurred: ' + error.message, 'error');
    }
});

// Function to generate random credentials (username and password)
function generateRandomCredentials(domain) {
    const username = 'user' + Math.random().toString(36).substring(7); // Random username
    const password = Math.random().toString(36).substring(2, 10);  // Random password
    return { username, password };
}

// Function to display a new account in a separate box
function displayAccount(account) {
    const accountContainer = document.createElement('div');
    accountContainer.className = 'account-box';

    // Create a div for the email and password
    const accountDetails = document.createElement('div');
    accountDetails.className = 'account-details';
    accountDetails.textContent = `Email: ${account.address}, Password: ${account.password}`;

    // Append the details to the container
    accountContainer.appendChild(accountDetails);

    // Add the account box to the accounts section
    const accountsSection = document.getElementById('accountsSection');
    accountsSection.appendChild(accountContainer);

    // Display success message
    displayMessage('Account Created: ' + account.address, 'success');
}

// Function to display messages
function displayMessage(message, type) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = ''; // Clear previous messages
    messagesDiv.appendChild(messageElement);
}
