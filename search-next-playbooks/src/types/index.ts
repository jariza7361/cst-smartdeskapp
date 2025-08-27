// Sample Playbooks Page Component
function PlaybooksPage() {
    const [scripts, setScripts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        // Fetch OPA scripts from the server
        fetch('/api/opa-scripts')
            .then(response => response.json())
            .then(data => setScripts(data));
    }, []);

    const filteredScripts = scripts.filter(script => 
        script.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const executeScript = (scriptId) => {
        // Logic to execute the selected OPA script
        fetch(`/api/execute-script/${scriptId}`)
            .then(response => response.json())
            .then(result => {
                // Handle result
            })
            .catch(error => {
                // Handle error
            });
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
                        {script.name}
                        <button onClick={() => executeScript(script.id)}>Run</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}