function App() {
    const [fonts, setFonts] = React.useState([]);

    React.useEffect(() => {
        fetch('/api/fonts')
            .then(res => res.json())
            .then(data => {
                console.log("Dados recebidos:", data);
                setFonts(data);
            })
            .catch(err => console.error("Erro:", err));
    }, []);

    return (
        <div>
            <span>All fontes</span>
            <div className="grid-container">
                {fonts.map((font) => (
                    <div key={font._id} className="font-box">
                        <span className="font-name">{font.name}</span>
                        <p style={{fontSize: '12px', color: '#666'}}>
                            {font.foundry}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
