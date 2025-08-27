// Sample HTML structure
<div id="playbooks">
    <input type="text" id="search" placeholder="Search scripts..." />
    <ul id="script-list">
        <!-- Dynamically populated script list -->
    </ul>
</div>

// Sample JavaScript for filtering and executing scripts
const scripts = [
    { name: 'Script 1', description: 'Description for script 1' },
    { name: 'Script 2', description: 'Description for script 2' },
    // Add more scripts as needed
];

function renderScripts(filter = '') {
    const list = document.getElementById('script-list');
    list.innerHTML = '';
    scripts
        .filter(script => script.name.includes(filter))
        .forEach(script => {
            const li = document.createElement('li');
            li.innerHTML = `${script.name} - ${script.description} <button onclick="executeScript('${script.name}')">Execute</button>`;
            list.appendChild(li);
        });
}

function executeScript(scriptName) {
    // Logic to execute the OPA script
    console.log(`Executing ${scriptName}`);
    // Handle success and error
}

// Event listener for search input
document.getElementById('search').addEventListener('input', (event) => {
    renderScripts(event.target.value);
});

// Initial render
renderScripts();