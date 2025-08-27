import React, { useState, useEffect } from 'react';

const PlaybooksPage = () => {
    const [scripts, setScripts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Fetch scripts from your API or local storage
        const fetchScripts = async () => {
            const response = await fetch('/api/scripts');
            const data = await response.json();
            setScripts(data);
        };
        fetchScripts();
    }, []);

    const filteredScripts = scripts.filter(script =>
        script.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const executeScript = async (scriptId) => {
        // Logic to execute the script
        try {
            await fetch(`/api/scripts/${scriptId}/execute`, { method: 'POST' });
            alert('Script executed successfully!');
        } catch (error) {
            alert('Error executing script: ' + error.message);
        }
    };

    return (
        <div>
            <h1>Playbooks</h1>
            <input
                type="text"
                placeholder="Search scripts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ul>
                {filteredScripts.map(script => (
                    <li key={script.id}>
                        {script.name} - {script.description}
                        <button onClick={() => executeScript(script.id)}>Execute</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PlaybooksPage;