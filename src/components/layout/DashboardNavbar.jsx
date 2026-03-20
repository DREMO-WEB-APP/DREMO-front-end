import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import authService from '../../services/authService';

const portalLabel = {
    STUDENT: 'Student Portal',
    TEACHER: 'Teacher Portal',
    ADMIN: 'Admin Portal',
};

const DashboardNavbar = () => {
    const { user, logout } = useAuth();
    const { showNotification } = useNotification();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            if (user?.profileId) {
                await authService.logout(user.profileId);
            }
            logout();
            showNotification('Sesión cerrada correctamente', 'info');
            navigate('/email-app/');
        } catch (error) {
            console.error("Logout failed", error);
            logout();
            navigate('/email-app/');
        }
    };

    const avatarLetter = (user?.username?.[0] || '?').toUpperCase();

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
            zIndex: 100,
            transition: 'background-color var(--transition-normal), border-color var(--transition-normal)'
        }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                Dremo <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                    {portalLabel[user?.rol] || 'Portal'}
                </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div
                    className="theme-toggle"
                    onClick={toggleTheme}
                    role="button"
                    tabIndex={0}
                    title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                >
                    <div className="theme-toggle-thumb">
                        <span className="theme-toggle-icon" style={{ fontSize: '12px' }}>
                            {theme === 'dark' ? '🌙' : '☀️'}
                        </span>
                    </div>
                </div>

                {/* Profile Avatar Button */}
                <button
                    onClick={() => navigate('/email-app/profile')}
                    title="Ver mi perfil"
                    style={{
                        width: '38px', height: '38px', borderRadius: '50%',
                        backgroundColor: 'var(--primary)', border: 'none',
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontWeight: 'bold',
                        fontSize: '1rem', color: '#fff',
                        boxShadow: '0 0 0 2px var(--border)',
                        transition: 'box-shadow 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 0 2px var(--border)'}
                >
                    {avatarLetter}
                </button>

                <button onClick={handleLogout} className="btn btn-outline" style={{ borderColor: 'var(--error)', color: 'var(--error)' }}>
                    Cerrar Sesión
                </button>
            </div>
        </nav>
    );
};

export default DashboardNavbar;
