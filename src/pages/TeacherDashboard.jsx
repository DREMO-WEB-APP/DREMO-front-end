import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import profileService from '../services/profileService';

const TeacherDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            if (!user?.profileId) return;
            try {
                const data = await profileService.getProfileByRole(user.profileId, 'TEACHER');
                setProfile(data);
            } catch (err) {
                console.error('Failed to load teacher profile', err);
            }
        };
        fetch();
    }, [user]);

    const fullName = profile ? `${profile.names} ${profile.lastNames}` : user?.username;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <DashboardNavbar />
            <div className="container" style={{ padding: '2rem', flex: 1 }}>
                <h1 style={{ marginBottom: '0.5rem', color: 'var(--text)' }}>Panel del Docente</h1>
                <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
                    Bienvenido/a, <strong>{fullName}</strong>
                    {profile?.institute && (
                        <span style={{ marginLeft: '0.5rem', color: 'var(--primary)', fontSize: '0.9rem' }}>
                            · {profile.institute}
                        </span>
                    )}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

                    {/* My Students Card */}
                    <div className="card animate-fade-in">
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            👥 Mis Estudiantes
                        </h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.9rem', flex: 1 }}>
                            Directorio de estudiantes de <strong>{profile?.institute || 'tu institución'}</strong>. Consulta su información y estado.
                        </p>
                        <button
                            className="btn btn-outline"
                            style={{ width: '100%' }}
                            onClick={() => navigate('/teacher/students')}
                            disabled={!profile?.instituteId}
                        >
                            Ver Directorio
                        </button>
                    </div>

                    {/* Email Requests Card */}
                    <div className="card animate-fade-in" style={{ animationDelay: '0.1s', border: '1px solid var(--warning)' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            📨 Solicitudes de Email
                        </h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.9rem', flex: 1 }}>
                            Revisa y aprueba las peticiones de creación de correo institucional de tus estudiantes.
                        </p>
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', backgroundColor: 'var(--warning)', borderColor: 'var(--warning)' }}
                            onClick={() => navigate('/teacher/requests')}
                            disabled={!profile?.instituteId}
                        >
                            Gestionar Solicitudes
                        </button>
                    </div>

                    {/* Account Activations Card */}
                    <div className="card animate-fade-in" style={{ animationDelay: '0.2s', border: '1px solid var(--success)' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            ✨ Activación de Cuentas
                        </h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.9rem', flex: 1 }}>
                            Activa las cuentas de los estudiantes que ya tienen un correo asignado para que puedan ingresar.
                        </p>
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', backgroundColor: 'var(--success)', borderColor: 'var(--success)' }}
                            onClick={() => navigate('/teacher/activations')}
                            disabled={!profile?.instituteId}
                        >
                            Activar Cuentas
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
