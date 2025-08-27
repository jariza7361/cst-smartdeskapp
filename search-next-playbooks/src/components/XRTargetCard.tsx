<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Policy Playbooks</title>
    <style>
        body { font-family: Arial, sans-serif; }
        .policy { margin: 10px 0; }
        .active { color: green; }
        .inactive { color: red; }
    </style>
</head>
<body>
    <h1>Policy Playbooks</h1>
    <input type="text" id="search" placeholder="Search policies..." />
    <button id="addPolicy">Add New Policy</button>
    <div id="policyList"></div>

    <script>
        const policies = [
            { name: 'Policy 1', status: 'active' },
            { name: 'Policy 2', status: 'inactive' },
            // Add more policies as needed
        ];

        function renderPolicies(filter = '') {
            const policyList = document.getElementById('policyList');
            policyList.innerHTML = '';
            const filteredPolicies = policies.filter(policy => policy.name.includes(filter));
            filteredPolicies.forEach(policy => {
                const policyDiv = document.createElement('div');
                policyDiv.className = 'policy';
                policyDiv.innerHTML = `${policy.name} - <span class="${policy.status}">${policy.status}</span>`;
                policyList.appendChild(policyDiv);
            });
        }

        document.getElementById('search').addEventListener('input', (e) => {
            renderPolicies(e.target.value);
        });

        document.getElementById('addPolicy').addEventListener('click', () => {
            const newPolicyName = prompt('Enter new policy name:');
            if (newPolicyName) {
                policies.push({ name: newPolicyName, status: 'active' });
                renderPolicies();
            }
        });

        // Initial render
        renderPolicies();
    </script>
</body>
</html>