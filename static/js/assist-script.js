marked.setOptions({
    breaks: false,
    sanitize: false
});

document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const clearChatButton = document.getElementById('clear-chat-btn');

    // 1. Load Chat History from LocalStorage
    let chatHistory = loadChatHistory();

    function renderChatHistory() {
        chatMessages.innerHTML = '';
        chatHistory.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', message.role === 'user' ? 'message-user' : 'message-bot');
            
            const rawText = message.parts[0].text;

            const { maskedText, mathBlocks } = maskLaTeX(rawText);

            const htmlContent = marked.parse(maskedText);

            messageElement.innerHTML = unmaskLaTeX(htmlContent, mathBlocks);
            
            chatMessages.appendChild(messageElement);
        });

        if (window.MathJax) {
            MathJax.typesetPromise([chatMessages])
                .catch((err) => console.log('MathJax Typeset Error: ', err))
                .then(() => {
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                });
        } else {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    // --- Persistence Functions (History) ---

    function loadChatHistory() {
        const savedHistory = localStorage.getItem('chatHistory');
        if (savedHistory) {
            return JSON.parse(savedHistory);
        } else {
            return [{
                role: 'model',
                parts: [{ text: "Good day! Im Maya your AC Circuit analysis learning assistant. Ask me any concept, formula or problem you're working on in AC circuit analysis." }]
            }];
        }
    }

    function saveChatHistory() {
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }

    function clearChat() {
        chatHistory = [{
            role: 'model',
            parts: [{ text: "Good day! Im Maya your AC Circuit analysis learning assistant. Ask me any concept, formula or problem you're working on in AC circuit analysis." }]
        }];
        saveChatHistory(); // Save the reset state
        renderChatHistory();
    }

    async function handleSendMessage() {
        const userMessage = chatInput.value.trim();
        if (userMessage === "") return;

        chatHistory.push({ role: 'user', parts: [{ text: userMessage }] });
        saveChatHistory(); // Save after user types
        renderChatHistory();
        chatInput.value = "";

        const loadingEl = document.createElement('div');
        loadingEl.classList.add('message', 'message-bot', 'loading');
        loadingEl.textContent = '...';
        chatMessages.appendChild(loadingEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: chatHistory }), 
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();

            chatHistory.push({ role: 'model', parts: [{ text: data.reply }] });
            saveChatHistory(); // Save after bot replies
            
        } catch (error) {
            console.error('Error fetching from API:', error);
            chatHistory.push({ role: 'model', parts: [{ text: 'Sorry, I ran into an error. Please try again.' }] });
            saveChatHistory();
        } finally {
            renderChatHistory();
        }
    }

    function maskLaTeX(text) {
        const mathBlocks = [];
        
        // Match $$...$$ (Display Math)
        text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match) => {
            mathBlocks.push(match);
            return `@@MATH_BLOCK_${mathBlocks.length - 1}@@`;
        });
        
        // Match $...$ (Inline Math)
        text = text.replace(/\$((?:[^\$]|\\\$)+)\$/g, (match) => {
            mathBlocks.push(match);
            return `@@MATH_INLINE_${mathBlocks.length - 1}@@`;
        });
        
        return { maskedText: text, mathBlocks };
    }

    function unmaskLaTeX(text, mathBlocks) {
        return text
            .replace(/@@MATH_BLOCK_(\d+)@@/g, (_, index) => mathBlocks[index])
            .replace(/@@MATH_INLINE_(\d+)@@/g, (_, index) => mathBlocks[index]);
    }

    // --- Event Listeners ---
    sendButton.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSendMessage();
        }
    });

    clearChatButton.addEventListener('click', clearChat);
    renderChatHistory();
});