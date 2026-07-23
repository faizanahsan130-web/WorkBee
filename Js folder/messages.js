document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.querySelector('.chat-input-footer input');
    const sendButton = document.querySelector('.chat-input-footer button');
    const messagesBody = document.querySelector('.chat-messages-body');
    const chatItems = document.querySelectorAll('.chat-item');
    const chatHeaderTitle = document.querySelector('.chat-box-header span');

    // Function to send a message
    function sendMessage() {
        const messageText = chatInput.value.trim();
        if (messageText === '') return;

        // Create outgoing message element
        const newMessage = document.createElement('div');
        newMessage.className = 'message outgoing';
        newMessage.textContent = messageText;

        // Append to chat body and scroll down
        messagesBody.appendChild(newMessage);
        messagesBody.scrollTop = messagesBody.scrollHeight;

        // Clear input
        chatInput.value = '';
    }

    // Event listener for Send button
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    // Event listener for Enter key in input
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // Switch active chat when clicking on sidebar items
    chatItems.forEach(item => {
        item.addEventListener('click', () => {
            chatItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const name = item.querySelector('.chat-item-name').textContent;
            if (chatHeaderTitle) {
                chatHeaderTitle.textContent = name;
            }
        });
    });
});