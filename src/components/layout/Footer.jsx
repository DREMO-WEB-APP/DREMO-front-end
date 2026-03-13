const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer style={{
            borderTop: '1px solid var(--border)',
            backgroundColor: 'var(--surface)',
            padding: '1.25rem 2rem',
            marginTop: 'auto',
        }}>
            <div className="container" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
            }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                    Dremo &copy; {year}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Sistema de Gestión Educativa
                </span>
            </div>
        </footer>
    );
};

export default Footer;
