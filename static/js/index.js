// This listener calculates the header's height so the sidebar can stick perfectly below it
window.addEventListener('DOMContentLoaded', (event) => {
    const headerWrapper = document.getElementById('myHeaderWrapper');
    if (headerWrapper) {
        const headerHeight = headerWrapper.offsetHeight;
        document.documentElement.style.setProperty('--header-height', headerHeight + 'px');
    }

    loadTheoryHome();
});

//Opening side navigation bar function
function openNav() {
    // Finds the element with the ID 'mySidenav' and changes its CSS width to 250 pixels, making it visible
    document.getElementById("mySidenav").style.width = "250px";
    // Finds the element with the ID 'main' and pushes it to the right by 250 pixels to make space for the sidenav
    document.getElementById("main").style.marginLeft = "250px";
}

//Closing side navigation bar function
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
}

function setActiveTopNav(linkName) {
    const links = document.querySelectorAll('.topnav a');
    links.forEach(link => link.classList.remove('active'));

    links.forEach(link => {
        if (link.innerText === linkName) {
            link.classList.add('active');
        }
    })
}

function setActiveSubNav(clickedElement) {
    // 1. Remove 'active' from all subnav links
    const links = document.querySelectorAll('.subnav a');
    links.forEach(link => link.classList.remove('active'));

    // 2. Add 'active' to the clicked one
    if (clickedElement) {
        clickedElement.classList.add('active');
    }
}

function setActiveSideNav(clickedElement) {
    // 1. Remove 'active' from all sidenav links (excluding close button)
    const links = document.querySelectorAll('.sidenav a:not(.closebtn)');
    links.forEach(link => link.classList.remove('active'));

    // 2. Add 'active' to the clicked one
    if (clickedElement) {
        clickedElement.classList.add('active');
    }
}

function loadTheoryHome() {
    loadTopic('intro');
    closeNav();
    setActiveTopNav('THEORY'); // Highlight THEORY button
    setActiveSubNav(null); // Clear subnav highlights
}

//load topics
async function loadTopic(topicPath, clickedElement) {
    const contentDiv = document.getElementById('main-content-area');
    
    if(!contentDiv) {
        console.error("Error: Could not find element with id 'main-content-area'")
        return;
    }

    if (clickedElement) {
        setActiveSideNav(clickedElement);
    }

    contentDiv.innerHTML = '<p>Loading...</p>';

    try {
        const response = await fetch(`/get_content/${topicPath}`);
        if (!response.ok) throw new Error("Network Error");

        const htmlData = await response.text();
        contentDiv.innerHTML = htmlData;

        if (window.MathJax) {
            MathJax.typesetPromise([contentDiv]);
        }
    } catch (error) {
        contentDiv.innerHTML = '<p style="color:red">Error loading content.</p>';
        console.error(error);
    }
}

//change sidebar content when in different topic links
function showSidenav(topic, clickedSubNavLink) {
    // Gets a reference to the sidenav DOM element
    var sidenav = document.getElementById("mySidenav");
    // Initializes an empty string to build the new HTML content for the sidebar
    var content = "";

    if(clickedSubNavLink) {
        setActiveSubNav(clickedSubNavLink);
    }
    
    // Keep THEORY highlighted since we are still in the theory section
    setActiveTopNav('THEORY');

    //topic switching
    switch (topic) {
        case 'sign':
            //HTML fot sign section
            content += '<h3>Passive Sign</h3>'; //Add title
            content += `<a href="#" onclick="loadTopic('sign/basic', this)">Basics</a>`;
            content += `<a href="#" onclick="loadTopic('sign/passive', this)">Passive Element</a>`;
            content += `<a href="#" onclick="loadTopic('sign/active', this)">Active Element</a>`;
            content += `<a href="#" onclick="loadTopic('sign/summary', this)">Summary</a>`;
            break;//Exit switch statement

        case 'impedance':
            //HTML for the impedance section
            content += '<h3>Impedance</h3>'; //Add title
            content += `<a href="#" onclick="loadTopic('impedance/introduction', this)">Introduction</a>`;
            content += `<a href="#" onclick="loadTopic('impedance/joperator', this)">'j' Operator</a>`;
            content += `<a href="#" onclick="loadTopic('impedance/seriesRLC', this)">Series RLC</a>`;
            content += `<a href="#" onclick="loadTopic('impedance/reactance', this)">Reactance</a>`;
            content += `<a href="#" onclick="loadTopic('impedance/impedance triangle', this)">Impedance Triangle</a>`;
            content += `<a href="#" onclick="loadTopic('impedance/pitfall', this)">Common Mistakes</a>`;
            break; //Exit switch statement

        case 'nodal':
            //HTML for the nodal section
            content += '<h3>Nodal</h3>'; //Add title
            content += `<a href="#" onclick="loadTopic('nodal/introduction', this)">Introduction</a>`;
            content += `<a href="#" onclick="loadTopic('nodal/procedure', this)">Nodal Procedure</a>`;
            content += `<a href="#" onclick="loadTopic('nodal/supernode', this)">Supernode</a>`;
            content += `<a href="#" onclick="loadTopic('nodal/pitfall', this)">Summary</a>`;
            break; //Exit switch statement

        case 'mesh':
            //HTML for the mesh section
            content += '<h3>Mesh</h3>'; //Add title
            content += `<a href="#" onclick="loadTopic('mesh/introduction', this)">Introduction</a>`;
            content += `<a href="#" onclick="loadTopic('mesh/procedure', this)">Mesh Procedure</a>`;
            content += `<a href="#" onclick="loadTopic('mesh/supermesh', this)">Supermesh</a>`;
            content += `<a href="#" onclick="loadTopic('mesh/pitfall', this)">Summary</a>`;
            break; //Exit switch statement

        case 'phasor':
            //HTML for the phasor section
            content += '<h3>Basic Element & Phasor</h3>'; //Add title
            content += `<a href="#" onclick="loadTopic('phasor/introduction', this)">Introduction</a>`;
            content += `<a href="#" onclick="loadTopic('phasor/resistor', this)">Resistor</a>`;
            content += `<a href="#" onclick="loadTopic('phasor/inductor', this)">Inductor</a>`;
            content += `<a href="#" onclick="loadTopic('phasor/capacitor', this)">Capacitor</a>`;
            content += `<a href="#" onclick="loadTopic('phasor/CIVIL', this)">CIVIL</a>`;
            break;

        case 'twoport':
            //HTML for the phasor section
            content += '<h3>Two-Port Network</h3>'; //Add title
            content += `<a href="#" onclick="loadTopic('pointnetwork/introduction', this)">Introduction</a>`;
            content += `<a href="#" onclick="loadTopic('pointnetwork/zparameter', this)">Z Parameter</a>`;
            content += `<a href="#" onclick="loadTopic('pointnetwork/yparameter', this)">Y Parameter</a>`;
            content += `<a href="#" onclick="loadTopic('pointnetwork/summary', this)">Summary</a>`;
            break;

        case 'powerfactor':
            //HTML for the power factor section
            content += '<h3>Power Factor</h3>'; //Add title
            content += `<a href="#" onclick="loadTopic('power/introduction', this)">Introduction</a>`;
            content += `<a href="#" onclick="loadTopic('power/powertri', this)">Power Triangle</a>`;
            content += `<a href="#" onclick="loadTopic('power/leadlag', this)">Lead VS Lag</a>`;
            content += `<a href="#" onclick="loadTopic('power/pfcorrection', this)">Power Factor Correction</a>`;
            break;
        
        // If the topic doesn't match any case (a failsafe)
        default:
            content += '<a href="#">Select a topic</a>';
    }

    // This section updates the sidebar's content without deleting the close button.
    // 1. Get a reference to the close button element.
    var closeButton = sidenav.getElementsByClassName("closebtn")[0];
    // 2. Clear all existing HTML content from the sidebar.
    sidenav.innerHTML = "";
    // 3. Add the close button element back into the now-empty sidebar.
    sidenav.appendChild(closeButton);
    // 4. Append the new content (the links we built in the switch statement) after the close button.
    sidenav.innerHTML += content;

    // Finally, call the openNav() function to make sure the sidebar is visible with its new content.
    openNav();
}