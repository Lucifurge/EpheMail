// Event listener for the "Create Account" button
document.getElementById('createAccountBtn').addEventListener('click', async function () {
    try {
        // Display the loading message
        displayMessage('Creating account...', 'info');

        // Call the backend API to get account info
        const response = await axios.post('https://eppheapi-production.up.railway.app/create-account'); // Your production URL
        console.log(response.data);  // Log the response to inspect the structure

        // Ensure response contains an address and extract domain
        const domain = response.data.address.split('@')[1];  // Extract domain from email address

        if (!domain) {
            displayMessage('Domain not found!', 'error');
            return;
        }

        console.log('Available Domain:', domain);

        // Show the created account address
        const createdEmail = response.data.address;
        displayMessage(`Account created: ${createdEmail}`, 'success');

        // Show the account creation result in the form container
        document.getElementById('accountResult').style.display = 'block';
        document.getElementById('form-text').textContent = JSON.stringify(response.data, null, 2);

        // Fetch messages from the created email address
        await fetchMessages(createdEmail);

    } catch (error) {
        console.error('Error in main process:', error.message);
        displayMessage('Error occurred: ' + error.message, 'error');
    }
});

// Function to fetch messages for the created email address
async function fetchMessages(email) {
    try {
        // Fetch messages using the provided email
        const response = await axios.get(`https://eppheapi-production.up.railway.app/messages?email=${email}`);

        // Handle the messages
        const messages = response.data['hydra:member'];

        if (messages.length === 0) {
            addInboxMessage('No messages in your inbox', '', 'No messages available.');
        } else {
            messages.forEach(message => {
                addInboxMessage(message.from.address, message.subject, message.intro);
            });
        }
    } catch (error) {
        console.error('Error fetching messages:', error);
        displayMessage('Error fetching messages: ' + error.message, 'error');
    }
}

// Function to add inbox messages to the page
function addInboxMessage(from, subject, message) {
    const inboxDiv = document.getElementById('inbox');
    const inboxItem = document.createElement('div');
    inboxItem.classList.add('inbox-item');
    inboxItem.innerHTML = `<p><strong>From:</strong> ${from}</p><p><strong>Subject:</strong> ${subject}</p><p>${message}</p>`;
    inboxItem.addEventListener('click', () => alert('Email opened: ' + subject));
    inboxDiv.appendChild(inboxItem);
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
