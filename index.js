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

        // Create the account using the backend API
        const account = await createAccount(domain);
        displayMessage('Account Created: ' + JSON.stringify(account), 'success');
    } catch (error) {
        console.error('Error in main process:', error.message);
        displayMessage('Error occurred: ' + error.message, 'error');
    }
});

// Function to create random credentials (username and password)
function generateRandomCredentials(domain) {
    const username = faker.internet.userName(); // Generate a random username
    const password = faker.internet.password();  // Generate a random password
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

// Function to display messages
function displayMessage(message, type) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = ''; // Clear previous messages
    messagesDiv.appendChild(messageElement);
}
