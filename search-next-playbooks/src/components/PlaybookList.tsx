import React, { useState, useEffect } from 'react';

const PlaybooksPage = () => {
    const [playbooks, setPlaybooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Fetch playbooks from API
        const fetchPlaybooks = async () => {
            const response = await fetch('/api/playbooks');
            const data = await response.json();
            setPlaybooks(data);
        };
        fetchPlaybooks();
    }, []);

    const filteredPlaybooks = playbooks.filter(playbook =>
        playbook.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <h1>Playbooks for Open Policy Scripts</h1>
            <input
                type="text"
                placeholder="Search playbooks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ul>
                {filteredPlaybooks.map(playbook => (
                    <li key={playbook.id}>{playbook.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default PlaybooksPage;