document.getElementById('createAccountBtn').addEventListener('click', async function () {
    try {
        // Display the loading message
        displayMessage('Creating account...', 'info');

        const accountBox = document.getElementById('accountBox'); // Get the account display box
        accountBox.innerHTML = ''; // Clear previous account entries

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

        // Generate random credentials
        const account = await createAccount(domain);

        // Add the account details to the account box
        const accountEntry = document.createElement('div');
        accountEntry.textContent = `Email: ${account.address}, Password: ${account.password}`;
        accountEntry.className = 'account-item';
        accountBox.appendChild(accountEntry);

        // Final success message
        displayMessage('Account created successfully!', 'success');
        
        // Wait for 1 second before allowing the next click
        await delay(1000);
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
        
        // If rate-limited (status code 429), wait for a longer delay
        if (error.response && error.response.status === 429) {
            console.log('Rate limit exceeded, waiting for a longer delay...');
            await delay(5000); // Wait 5 seconds before retrying
            return createAccount(domain); // Retry the request
        }

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
