import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotFoundPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleBack = () => {
        if (user) {
            navigate('/email-app/dashboard'); // Let the DashboardRedirect handle the correct route
        } else {
            navigate('/email-app/');
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background)' }}>
            <div className="card animate-fade-in" style={{ maxWidth: '450px', width: '90%', textAlign: 'center', padding: '3rem 2rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem', lineHeight: '1' }}>🤔</div>
                <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '2rem' }}>404</h1>
                <h2 style={{ color: 'var(--text)', marginBottom: '1rem', fontSize: '1.25rem' }}>Página no encontrada</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
                    Parece que te has perdido. La página que estás buscando no existe o ha sido movida temporalmente.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button className="btn btn-outline" onClick={() => navigate(-1)}>
                        Regresar
                    </button>
                    <button className="btn btn-primary" onClick={handleBack}>
                        Ir al Inicio
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
