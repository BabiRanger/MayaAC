window.addEventListener('DOMContentLoaded', (event) => {
    const headerWrapper = document.getElementById('myHeaderWrapper');
    if (headerWrapper) {
        document.documentElement.style.setProperty('--header-height', headerWrapper.offsetHeight + 'px');
    }
    loadTopic('exercise_intro');
});

function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
}


function setActiveSubNav(clickedElement) {
    const links = document.querySelectorAll('.subnav a');
    links.forEach(link => link.classList.remove('active'));
    if (clickedElement) clickedElement.classList.add('active');
}

function setActiveSideNav(clickedElement) {
    // Remove active class from all sidebar links (except the close button)
    const links = document.querySelectorAll('.sidenav a:not(.closebtn)');
    links.forEach(link => link.classList.remove('active'));

    // Add active class to the one we just clicked
    if (clickedElement) {
        clickedElement.classList.add('active');
    }
}

async function loadTopic(topicPath, clickedElement) {
    
    // If a button was clicked, highlight it immediately
    if (clickedElement) {
        setActiveSideNav(clickedElement);
    }

    const contentDiv = document.getElementById('main-content-area');
    contentDiv.innerHTML = '<p>Loading...</p>';
    try {
        const response = await fetch(`/get_content/${topicPath}`);
        if (!response.ok) throw new Error("Network Error");
        const htmlData = await response.text();
        contentDiv.innerHTML = htmlData;
        if (window.MathJax) MathJax.typesetPromise([contentDiv]);
    } catch (error) {
        contentDiv.innerHTML = '<p style="color:red">Error loading content.</p>';
    }
}


function showExerciseNav(difficulty, clickedSubNavLink) {
    var sidenav = document.getElementById("mySidenav");
    var content = "";

    if(clickedSubNavLink) setActiveSubNav(clickedSubNavLink);

    const topicHeader = (title) => `
        <p style="
            font-size: 11px; 
            color: #666; 
            margin: 20px 0 5px 32px; 
            font-weight: 800; 
            text-transform: uppercase; 
            letter-spacing: 1px;">
            ${title}
        </p>`;

    switch (difficulty) {
        case 'easy':
            content += '<h3>Easy</h3>'; 
            
            content += topicHeader('Sinusoids');
            content += `<a href="#" onclick="loadTopic('exercises/easy/psq1', this)">1. Phase Difference</a>`;
            content += `<a href="#" onclick="loadTopic('exercises/easy/sinq2', this)">2. Lead vs Lag</a>`;
            
            content += topicHeader('Phasors');
            content += `<a href="#" onclick="loadTopic('exercises/easy/pcq1', this)">1. Phasor Conversion</a>`;
            content += `<a href="#" onclick="loadTopic('exercises/easy/phaq2', this)">2. Phasor to Time</a>`;
            break;

        case 'moderate':
            content += '<h3>Moderate Level</h3>';

            content += topicHeader('Calculus & Phasors');
            content += `<a href="#" onclick="loadTopic('exercises/moderate/calintq1', this)">1. Integro-Differential</a>`;
            content += `<a href="#" onclick="loadTopic('exercises/moderate/tranq2', this)">2. Simplify Sinusoids</a>`;

            content += topicHeader('Simple Circuits');
            content += `<a href="#" onclick="loadTopic('exercises/moderate/basicrlsq1', this)">1. Series RLC Voltage</a>`;
            content += `<a href="#" onclick="loadTopic('exercises/moderate/circq2', this)">2. Find Branch Current</a>`;

            content += topicHeader('Design Problems');
            content += `<a href="#" onclick="loadTopic('exercises/moderate/revengq1', this)">1. Find Component Values</a>`;
            
            content += topicHeader('Analysis');
            content += `<a href="#" onclick="loadTopic('exercises/moderate/circanq1', this)">1. Find Current i(t)</a>`;
            content += `<a href="#" onclick="loadTopic('exercises/moderate/analycq2', this)">2. RLC Voltage</a>`;
            content += `<a href="#" onclick="loadTopic('exercises/moderate/analycq3', this)">3. Bridge Network</a>`;
            break;

        case 'challenging':
            content += '<h3>Challenging</h3>';

            content += topicHeader('Network Impedance Analysis');
            content += `<a href="#" onclick="loadTopic('exercises/challenging/f1', this)">1. AC Circuit Simplification</a>`;
            content += `<a href="#" onclick="loadTopic('exercises/challenging/f6', this)">2. Laplace Transform</a>`;
            content += `<a href="#" onclick="loadTopic('exercises/challenging/f8', this)">3. Two Port Network</a>`;
            content += `<a href="#" onclick="loadTopic('exercises/challenging/f9', this)">4. Terminated Two Port Network</a>`;

            content += topicHeader('Nodal Analysis');
            content += `<a href="#" onclick="loadTopic('exercises/challenging/f4', this)">1. Supernode</a>`;
            content += `<a href="#" onclick="loadTopic('exercises/challenging/f10', this)">2. Supernode</a>`;

            content += topicHeader('Mesh Analysis');
            content += `<a href="#" onclick="loadTopic('exercises/challenging/f3', this)">1. Dependent Source Analysis</a>`;
            content += `<a href="#" onclick="loadTopic('exercises/challenging/f2', this)">2. Mixed Source Analysis</a>`;
            content += `<a href="#" onclick="loadTopic('exercises/challenging/f11', this)">3. AC Mesh Analysis</a>`;

            content += topicHeader('Frequency Responce/Resonance');
            content += `<a href="#" onclick="loadTopic('exercises/challenging/f5', this)">1. Series Resonance Analysis</a>`;
            content += `<a href="#" onclick="loadTopic('exercises/challenging/f7', this)">2. Bode Plots</a>`;

            content += topicHeader('Power Factor');
            content += `<a href="#" onclick="loadTopic('exercises/challenging/f12', this)">1. AC Power Analysis</a>`;

            content += '<h5></h5>';
            break;

        default:
            content += '<p style="padding:20px">Select a difficulty level.</p>';
    }

    var closeButton = sidenav.getElementsByClassName("closebtn")[0];
    sidenav.innerHTML = "";
    if(closeButton) sidenav.appendChild(closeButton);
    sidenav.innerHTML += content;

    openNav();
}

async function checkAnswerWithAI(problemContext, correctAnswer) {
    const studentInput = document.getElementById('student-answer').value;
    const feedbackBox = document.getElementById('ai-feedback');
    
    if (!studentInput.trim()) {
        alert("Please type an answer first!");
        return;
    }

    feedbackBox.style.display = 'block';
    feedbackBox.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Checking your logic...';

    const prompt = `
    I am a student working on this circuit problem: "${problemContext}".
    The correct answer is: "${correctAnswer}".
    My attempt is: "${studentInput}".
    Please check if I am correct. If wrong, explain the mistake briefly.
    `;

    try {
        const history = [{ role: 'user', parts: [{ text: prompt }] }];
        
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history: history }), 
        });

        const data = await response.json();

        const formattedReply = marked.parse(data.reply);

        feedbackBox.innerHTML = `<strong><i class="fa-solid fa-robot"></i> Assistant:</strong> ${formattedReply}`;

        if (window.MathJax) {
            MathJax.typesetPromise([feedbackBox]);
        }

    } catch (error) {
        console.error(error);
        feedbackBox.innerHTML = 'Error connecting to AI assistant.';
    }
}

async function showFullSolution(solutionKey) {
    const feedbackBox = document.getElementById('ai-feedback');
    const studentInput = document.getElementById('student-answer');
    
    if (!studentInput.value.trim()) {
        studentInput.value = "Requested full solution.";
    }

    feedbackBox.style.display = 'block';
    feedbackBox.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating step-by-step solution...';

    const prompt = `
    Act as a tutor. I am a student who is completely stuck on this AC circuit problem and I need to see the full steps to understand it. 
    Here is the official solution key: "${solutionKey}".
    Please explain these steps clearly and logically, one by one. 
    Format all math equations and variables using LaTeX (enclose inline math in $ and display math in $$).
    `;

    try {
        const history = [{ role: 'user', parts: [{ text: prompt }] }];
        
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history: history }), 
        });

        const data = await response.json();

        // NEW: Check if the backend sent an error message instead of a reply
        if (data.error) {
            throw new Error(data.error); 
        }
        
        const formattedReply = marked.parse(data.reply);
        
        // Use a different icon/header to indicate it's the full solution
        feedbackBox.innerHTML = `<strong><i class="fa-solid fa-chalkboard-user"></i> Full Solution:</strong><br><br>${formattedReply}`;

        if (window.MathJax) {
            MathJax.typesetPromise([feedbackBox]);
        }

    } catch (error) {
        console.error("The actual error is:", error);
        
        // Check if the error message from the backend contains the '503' or 'demand' keyword
        if (error.message && error.message.includes("high demand")) {
            feedbackBox.innerHTML = '<span style="color: #d97706;">⚠️ The AI is currently experiencing high demand. Please wait a few seconds and try again.</span>';
        } else {
            // NEW: Print the actual error message to the screen so we can see what's wrong!
            feedbackBox.innerHTML = `<span style="color: #dc2626;">❌ AI Error: ${error.message}</span>`;
        }
    }
}
