document.getElementById('createAccountBtn').addEventListener('click', async function () {
    try {
        // Display the loading message
        displayMessage('Creating account...', 'info');

        // Call the backend API to get account info
        const response = await axios.post('https://eppheapi-production.up.railway.app/create-account');
        console.log(response.data);

        // Ensure response contains an address and extract domain
        const domain = response.data.address.split('@')[1];

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

        // Fetch inbox messages using the created email address
        fetchMessages(address);

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

// Function to fetch inbox messages for the created email address
async function fetchMessages(email) {
    try {
        const response = await axios.get(`https://eppheapi-production.up.railway.app/messages?email=${email}`);
        console.log('Messages:', response.data);

        if (response.data['hydra:member'].length > 0) {
            const messages = response.data['hydra:member'];
            messages.forEach(message => {
                addInboxMessage(message.from.address, message.subject, message.intro);
            });
        } else {
            displayMessage('No messages found in your inbox.', 'info');
        }
    } catch (error) {
        console.error('Error fetching messages:', error);
        displayMessage('Error fetching messages: ' + error.message, 'error');
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

// Function to add inbox messages to the page
function addInboxMessage(from, subject, intro) {
    const inboxDiv = document.getElementById('inbox');
    const inboxItem = document.createElement('div');
    inboxItem.classList.add('inbox-item');
    inboxItem.innerHTML = `<p><strong>From:</strong> ${from}</p><p><strong>Subject:</strong> ${subject}</p><p>${intro}</p>`;
    inboxItem.addEventListener('click', () => alert('Email opened: ' + subject));
    inboxDiv.appendChild(inboxItem);
}
