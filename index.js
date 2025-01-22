// Initialize Supabase client
window.onload = () => {
    const supabaseUrl = 'https://ocdcqlcqeqrizxbvfiwp.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZGNxbGNxZXFyaXp4YnZmaXpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1MzkwOTEsImV4cCI6MjA1MzExNTA5MX0.g9rGkVFMxI8iqBNtGzeDvkDGfbmSZhq7J32LITaTkq0';
    const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

    // Event listener for the "Create Account" button
    document.getElementById('createAccountBtn').addEventListener('click', async function () {
        try {
            // Display the loading message
            displayMessage('Creating account...', 'info');

            // Call the backend API to create an account
            const response = await axios.post('https://eppheapi-production.up.railway.app/create-account'); // Backend endpoint
            console.log(response.data);  // Log the response to inspect the structure

            const accountDetails = response.data;
            const { address, password } = accountDetails;

            // Display the account creation details
            displayMessage('Account Created: ' + JSON.stringify(accountDetails), 'success');
            document.getElementById('accountResult').style.display = 'block';
            document.getElementById('form-text').textContent = `Email: ${address}\nPassword: ${password}`;

            // Insert account into Supabase database
            const { data, error } = await _supabase
                .from('users')  // Assuming you have a table named 'users'
                .insert([{
                    email: address,
                    password: password
                }]);

            if (error) {
                displayMessage('Error saving account to database: ' + error.message, 'error');
                return;
            }

            console.log('Account saved to Supabase:', data);

            // Authenticate the user to get a token
            const authResponse = await axios.post('https://eppheapi-production.up.railway.app/authenticate', {
                address,
                password
            });

            const token = authResponse.data.token;
            console.log('Authentication successful, token:', token);

            if (token) {
                // Fetch messages using the token
                const messagesResponse = await axios.post('https://eppheapi-production.up.railway.app/fetch-messages', { token });

                const messages = messagesResponse.data.messages;
                if (messages && messages.length > 0) {
                    messages.forEach(message => {
                        addInboxMessage(message.from.address, message.subject, message.intro);
                    });
                } else {
                    addInboxMessage('No messages found.');
                }
            } else {
                displayMessage('Failed to authenticate.', 'error');
            }

        } catch (error) {
            console.error('Error in main process:', error.message);
            displayMessage('Error occurred: ' + error.message, 'error');
        }
    });

    // Function to display messages (Success/Error/Info)
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

    // Function to copy text (account info)
    function copyText() {
        const text = document.getElementById('form-text').textContent;
        navigator.clipboard.writeText(text).then(() => {
            alert('Text copied to clipboard!');
        }).catch(err => {
            alert('Error copying text: ' + err);
        });
    }
};
