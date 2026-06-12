marked.setOptions({
    breaks: false,
    sanitize: false
});

// Image state variables
    let currentImageBase64 = null;
    let currentImageMimeType = null;

    // New DOM elements
    const imageUploadInput = document.getElementById('image-upload');
    const uploadBtn = document.getElementById('upload-btn');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const removeImageBtn = document.getElementById('remove-image-btn');

    // Trigger file selection
    uploadBtn.addEventListener('click', () => {
        imageUploadInput.click();
    });

    // Handle file selection and convert to Base64
    imageUploadInput.addEventListener('change', function() {
        // We bypass brackets entirely and use .item(0) to force it to grab the actual image Blob
        const myImage = imageUploadInput.files.item(0);
        
        // If the user cancels the upload, stop here
        if (!myImage) {
            return; 
        }

        // This should now print the actual image name (e.g., "circuit.png") instead of "FileList"
        console.log("SUCCESS! The image is:", myImage.name);

        const reader = new FileReader();
        reader.onload = function(e) {
            const dataUrl = e.target.result;
            const commaIndex = dataUrl.indexOf(',');
            currentImageBase64 = dataUrl.substring(commaIndex + 1);
            currentImageMimeType = myImage.type;
            
            // Show preview
            imagePreview.src = dataUrl;
            imagePreviewContainer.classList.remove('hidden');
        };
        
        // Execute using the guaranteed single image Blob
        reader.readAsDataURL(myImage);
    });

    // Remove image logic
    removeImageBtn.addEventListener('click', clearImagePreview);

    function clearImagePreview() {
        currentImageBase64 = null;
        currentImageMimeType = null;
        imagePreview.src = '';
        imagePreviewContainer.classList.add('hidden');
        imageUploadInput.value = '';
    }

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
            
            let fullHtmlContent = '';

            // Loop through all parts (text or image)
            message.parts.forEach(part => {
                if (part.text) {
                    const { maskedText, mathBlocks } = maskLaTeX(part.text);
                    const htmlContent = marked.parse(maskedText);
                    fullHtmlContent += unmaskLaTeX(htmlContent, mathBlocks);
                }
                if (part.inline_data) {
                    // Render the image into the chat bubble
                    fullHtmlContent += `<div class="mt-2 mb-2"><img src="data:${part.inline_data.mime_type};base64,${part.inline_data.data}" class="max-w-[250px] h-auto rounded shadow-md border border-gray-200" /></div>`;
                }
            });

            messageElement.innerHTML = fullHtmlContent;
            chatMessages.appendChild(messageElement);
        });

        if (window.MathJax && typeof MathJax.typesetPromise === 'function') {
            MathJax.typesetPromise([chatMessages])
                .catch((err) => console.log('MathJax Typeset Error: ', err))
                .then(() => {
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                });
        } else {
            // If MathJax isn't ready yet, just scroll to the bottom normally
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
                parts: [{ text: "Good day! Im iLela your AC Circuit analysis learning assistant. Ask me any concept, formula or problem you're working on in AC circuit analysis." }]
            }];
        }
    }

    function saveChatHistory() {
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }

    function clearChat() {
        chatHistory = [{
            role: 'model',
            parts: [{ text: "Good day! Im iLela your AC Circuit analysis learning assistant. Ask me any concept, formula or problem you're working on in AC circuit analysis." }]
        }];
        saveChatHistory(); // Save the reset state
        renderChatHistory();
    }

    async function handleSendMessage() {
        const userMessage = chatInput.value.trim();
        
        // Prevent sending if both text and image are empty
        if (userMessage === "" && !currentImageBase64) return;

        // Build the multi-part payload
        const parts = [];
        if (userMessage) {
            parts.push({ text: userMessage });
        }
        if (currentImageBase64) {
            parts.push({
                inline_data: {
                    mime_type: currentImageMimeType,
                    data: currentImageBase64
                }
            });
        }

        // Push the formatted parts to the history
        chatHistory.push({ role: 'user', parts: parts });
        saveChatHistory(); 
        renderChatHistory();
        
        // Clear input and image preview
        chatInput.value = "";
        clearImagePreview();

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
            saveChatHistory(); 
            
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
    
    // Match $$...$$ AND \[...\] (Display Math)
    text = text.replace(/(\$\$|\\\[)([\s\S]*?)(\$\$|\\\])/g, (match) => {
        mathBlocks.push(match);
        return `@@MATH_BLOCK_${mathBlocks.length - 1}@@`;
    });
    
    // Match $...$ AND \(...\) (Inline Math)
    // Using a non-greedy match (.*?) to prevent swallowing text between two separate inline equations
    text = text.replace(/(\$|\\\()([\s\S]*?)(\$|\\\))/g, (match) => {
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