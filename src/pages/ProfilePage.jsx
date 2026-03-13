import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import profileService from '../services/profileService';

const roleLabel = {
    STUDENT: 'Estudiante',
    TEACHER: 'Docente',
    ADMIN: 'Administrador',
};

const dashboardByRole = {
    STUDENT: '/student/dashboard',
    TEACHER: '/teacher/dashboard',
    ADMIN: '/admin/dashboard',
};

const ProfilePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.profileId || !user?.rol) return;
            try {
                const data = await profileService.getProfileByRole(user.profileId, user.rol);
                setProfile(data);
            } catch (err) {
                console.error('Failed to fetch profile', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    const InfoRow = ({ label, value }) => (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            padding: '1rem',
            borderBottom: '1px solid var(--border)'
        }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
            <span style={{ fontSize: '1.05rem', fontWeight: '500', color: 'var(--text)' }}>{value || '—'}</span>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <DashboardNavbar />
            <div className="container" style={{ padding: '2rem', flex: 1, maxWidth: '700px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <button
                        onClick={() => navigate(dashboardByRole[user?.rol] || '/')}
                        className="btn btn-outline"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem' }}
                    >
                        ← Volver
                    </button>
                    <h1 style={{ margin: 0, color: 'var(--text)' }}>Mi Perfil</h1>
                </div>

                {loading ? (
                    <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Cargando perfil...</div>
                ) : (
                    <>
                        {/* Avatar + Name Card */}
                        <div className="card animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '50%',
                                backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: '2rem', color: '#fff',
                                flexShrink: 0, fontWeight: 'bold'
                            }}>
                                {(profile?.names?.[0] || user?.username?.[0] || '?').toUpperCase()}
                            </div>
                            <div>
                                <h2 style={{ margin: 0, color: 'var(--text)' }}>
                                    {profile ? `${profile.names} ${profile.lastNames}` : user?.username}
                                </h2>
                                <span style={{
                                    display: 'inline-block', marginTop: '0.4rem',
                                    padding: '0.2rem 0.8rem', borderRadius: 'var(--radius-full)',
                                    backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)',
                                    fontSize: '0.85rem', fontWeight: '600'
                                }}>
                                    {roleLabel[user?.rol] || user?.rol}
                                </span>
                            </div>
                        </div>

                        {/* Info Card */}
                        <div className="card animate-fade-in" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-hover)' }}>
                                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--primary)' }}>Información Personal</h3>
                            </div>
                            <InfoRow label="Usuario" value={user?.username} />
                            {profile && <>
                                <InfoRow label="Nombres" value={profile.names} />
                                <InfoRow label="Apellidos" value={profile.lastNames} />
                                <InfoRow label="DNI" value={profile.dni} />
                                {profile.institute && <InfoRow label="Institución Educativa" value={profile.institute} />}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '1rem' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado de Cuenta</span>
                                    <span style={{
                                        display: 'inline-block', width: 'fit-content',
                                        padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)',
                                        backgroundColor: profile.userStatus === 'ACTIVE' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                                        color: profile.userStatus === 'ACTIVE' ? 'var(--success)' : 'var(--error)',
                                        fontWeight: '600', fontSize: '0.9rem',
                                        border: `1px solid ${profile.userStatus === 'ACTIVE' ? 'var(--success)' : 'var(--error)'}`
                                    }}>
                                        {profile.userStatus === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            </>}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
