import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 2rem',
            backgroundColor: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                Dremo
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <Link to="/email-app/login" className="btn btn-outline">
                    Iniciar Sesión
                </Link>
                <Link to="/email-app/register" className="btn btn-primary">
                    Registrarse
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
