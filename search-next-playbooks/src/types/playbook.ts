<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Open Policy Playbooks</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>Open Policy Playbooks</h1>
        <input type="text" id="search" placeholder="Search policies...">
    </header>
    <main>
        <section id="policy-list">
            <h2>Available Policies</h2>
            <ul id="policies">
                <!-- Policies will be dynamically populated here -->
            </ul>
        </section>
        <section id="policy-details">
            <h2>Policy Details</h2>
            <div id="details">
                <!-- Policy details will be displayed here -->
            </div>
            <button id="run-policy">Run Policy</button>
        </section>
    </main>
    <script src="script.js"></script>
</body>
</html>