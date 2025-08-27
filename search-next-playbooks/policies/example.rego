<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Playbooks</title>
</head>
<body>
    <h1>Open Policy Playbooks</h1>
    <input type="text" id="search" placeholder="Search for a policy...">
    <ul id="playbook-list">
        <!-- Dynamically populated list of playbooks -->
    </ul>

    <script>
        const playbooks = [/* Array of playbook names */];

        document.getElementById('search').addEventListener('input', function() {
            const query = this.value.toLowerCase();
            const filteredPlaybooks = playbooks.filter(playbook => playbook.toLowerCase().includes(query));
            // Update the UI with filteredPlaybooks
        });
    </script>
</body>
</html>