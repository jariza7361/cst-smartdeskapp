<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Playbooks</title>
</head>
<body>
    <h1>Open Policy Playbooks</h1>
    <input type="text" id="search" placeholder="Search scripts..." oninput="filterScripts()">
    <ul id="scriptList">
        <!-- List of scripts will be populated here -->
    </ul>

    <script>
        const scripts = [
            { name: 'Script 1', id: 1 },
            { name: 'Script 2', id: 2 },
            // Add more scripts as needed
        ];

        function populateScripts() {
            const list = document.getElementById('scriptList');
            list.innerHTML = '';
            scripts.forEach(script => {
                const li = document.createElement('li');
                li.textContent = script.name;
                li.onclick = () => executeScript(script.id);
                list.appendChild(li);
            });
        }

        function filterScripts() {
            const query = document.getElementById('search').value.toLowerCase();
            const filteredScripts = scripts.filter(script => script.name.toLowerCase().includes(query));
            const list = document.getElementById('scriptList');
            list.innerHTML = '';
            filteredScripts.forEach(script => {
                const li = document.createElement('li');
                li.textContent = script.name;
                li.onclick = () => executeScript(script.id);
                list.appendChild(li);
            });
        }

        function executeScript(id) {
            // Logic to execute the script
            console.log(`Executing script with ID: ${id}`);
        }

        // Initial population of scripts
        populateScripts();
    </script>
</body>
</html>