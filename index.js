document.getElementById('createAccountBtn').addEventListener('click', async function () {
    try {
        // Display the loading message
        displayMessage('Creating accounts...', 'info');

        const accounts = []; // Store generated accounts
        const accountBox = document.getElementById('accountBox'); // Get the account display box
        accountBox.innerHTML = ''; // Clear previous accounts

        // Call the backend API to get account info
        const response = await axios.post('https://eppheapi-production.up.railway.app/create-account'); // Updated to your production URL
        console.log(response.data); // Log the response to inspect the structure

        // Ensure response contains an address and extract domain
        const domain = response.data.address.split('@')[1]; // Extract domain from email address

        if (!domain) {
            displayMessage('Domain not found!', 'error');
            return;
        }

        console.log('Available Domain:', domain);

        // Create accounts in batches of 8 requests
        const batchSize = 8;
        const totalAccounts = 10;

        for (let i = 0; i < totalAccounts; i++) {
            const account = await createAccount(domain);
            accounts.push(account);

            // Add the account details to the account box
            const accountEntry = document.createElement('div');
            accountEntry.textContent = `Email: ${account.address}, Password: ${account.password}`;
            accountEntry.className = 'account-item';
            accountBox.appendChild(accountEntry);

            // Check if we need to wait before sending the next batch
            if ((i + 1) % batchSize === 0 && i + 1 < totalAccounts) {
                await delay(1000); // Wait for 1 second after every batch of 8
            }
        }

        // Final success message
        displayMessage('All accounts created successfully!', 'success');
    } catch (error) {
        console.error('Error in main process:', error.message);
        displayMessage('Error occurred: ' + error.message, 'error');
    }
});

// Function to generate random credentials (username and password)
function generateRandomCredentials(domain) {
    const username = 'user' + Math.random().toString(36).substring(7); // Random username
    const password = Math.random().toString(36).substring(2, 10); // Random password
    return { username, password };
}

// Function to create the account (backend API call)
async function createAccount(domain) {
    try {
        const { username, password } = generateRandomCredentials(domain);
        const address = `${username}@${domain}`;

        // Send request to Mail.tm API to create the account
        const response = await axios.post('https://api.mail.tm/accounts', {
            address,
            password,
        });

        console.log('Account Created:', response.data);

        return { address, password, data: response.data };
    } catch (error) {
        console.error('Error creating account:', error.message);
        throw error;
    }
}

// Function to create a delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
