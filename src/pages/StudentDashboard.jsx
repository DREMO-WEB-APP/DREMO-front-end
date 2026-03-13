import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import studentService from '../services/studentService';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import EmailCard from '../components/dashboard/EmailCard';
import StatusCard from '../components/dashboard/StatusCard';
// import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async () => {
        try {
            if (user?.profileId) {
                const data = await studentService.getProfileByAccount(user.profileId);
                setProfile(data);
            }
        } catch (error) {
            console.error("Failed to fetch profile", error);
        } finally {
            setLoading(false);
        }
    }, [user?.profileId]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <DashboardNavbar />
                <div className="container" style={{ padding: '2rem', textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <DashboardNavbar />

            <div className="container" style={{ padding: '2rem', flex: 1 }}>
                {/* Welcome Header */}
                <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ marginBottom: '0.25rem', color: 'var(--text)', fontSize: '2rem' }}>Hola, <span style={{ color: 'var(--primary)' }}>{profile?.names.split(' ')[0]}</span> 👋</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', margin: 0 }}>Bienvenido a tu panel de estudiante de <strong>{profile?.institute || 'tu institución'}</strong>.</p>
                    </div>
                </div>

                {profile ? (
                    <div className="dashboard-grid">
                        <style>{`
                            .dashboard-grid {
                                display: grid;
                                grid-template-columns: 1fr;
                                gap: 1.5rem;
                            }
                            @media (min-width: 768px) {
                                .dashboard-grid {
                                    grid-template-columns: repeat(2, 1fr);
                                }
                            }
                            @media (min-width: 1024px) {
                                .dashboard-grid {
                                    grid-template-columns: repeat(3, 1fr);
                                }
                                .email-span {
                                    grid-column: span 2;
                                }
                            }
                        `}</style>

                        {/* Top Important Cards */}
                        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                            <StatusCard
                                status={profile.userStatus}
                                profileId={profile.id}
                                onStatusChange={fetchProfile}
                            />
                        </div>

                        <div className="animate-fade-in email-span" style={{ animationDelay: '0.2s' }}>
                            <EmailCard email={profile.email} studentId={profile.id} />
                        </div>

                        {/* Quick Access or Info Cards (Placeholders for UX) */}
                        <div className="card animate-fade-in" style={{ animationDelay: '0.3s', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--primary)' }}>📚 Mis Cursos</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.9rem', flex: 1 }}>
                                Accede a tus materiales de clase, tareas programadas y recursos digitales.
                            </p>
                            <button className="btn btn-outline" style={{ width: '100%' }} disabled>En desarrollo</button>
                        </div>

                        <div className="card animate-fade-in" style={{ animationDelay: '0.4s', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--primary)' }}>📅 Mi Horario</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.9rem', flex: 1 }}>
                                Revisa el cronograma de tus clases y eventos próximos de la institución.
                            </p>
                            <button className="btn btn-outline" style={{ width: '100%' }} disabled>En desarrollo</button>
                        </div>

                        <div className="card animate-fade-in" style={{ animationDelay: '0.5s', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--primary)' }}>🏆 Calificaciones</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.9rem', flex: 1 }}>
                                Consulta tu progreso académico y notas de los periodos evaluados.
                            </p>
                            <button className="btn btn-outline" style={{ width: '100%' }} disabled>En desarrollo</button>
                        </div>

                    </div>
                ) : (
                    <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        No se pudo cargar la información del perfil.
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
