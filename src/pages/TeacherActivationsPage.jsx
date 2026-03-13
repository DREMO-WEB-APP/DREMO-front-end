import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import profileService from '../services/profileService';
import studentService from '../services/studentService';

const TeacherActivationsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const [profile, setProfile] = useState(null);
    const [inactiveStudents, setInactiveStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activating, setActivating] = useState(false);

    const loadData = async () => {
        if (!user?.profileId) return;
        setLoading(true);
        try {
            const teacherProfile = await profileService.getProfileByRole(user.profileId, 'TEACHER');
            setProfile(teacherProfile);

            if (teacherProfile?.instituteId) {
                const list = await studentService.getStudentsByInstitute(teacherProfile.instituteId);

                // Filter only students that are INACTIVE but ALREADY HAVE AN EMAIL assigned
                const filterList = list.filter(s => s.userStatus !== 'ACTIVE' && s.email);

                // Sort by last name A-Z
                filterList.sort((a, b) => a.lastNames.localeCompare(b.lastNames));
                setInactiveStudents(filterList);
            }
        } catch (err) {
            console.error('Error loading inactive students', err);
            showNotification('Error al cargar la lista de estudiantes', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [user]);

    const handleActivate = async (student) => {
        // Prevent concurrent activations on the same button
        if (activating) return;
        setActivating(student.id);

        try {
            await studentService.activateStudent(student.id);
            showNotification(`¡Estudiante ${student.names} activado con éxito!`, 'success');
            loadData(); // refresh list to remove the activated student
        } catch (err) {
            console.error('Activate failed', err);
            showNotification('Error al activar la cuenta del estudiante', 'error');
        } finally {
            setActivating(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <DashboardNavbar />
            <div className="container" style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <button onClick={() => navigate('/teacher/dashboard')} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem' }}>
                        ← Volver
                    </button>
                    <div>
                        <h1 style={{ margin: 0, color: 'var(--text)' }}>Activación de Cuentas</h1>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Estudiantes con correo institucional asignado, pendientes de activación
                        </p>
                    </div>
                </div>

                <div className="card animate-fade-in" style={{ padding: 0, overflow: 'hidden', flex: 1 }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border)', backgroundColor: 'var(--surface-hover)' }}>
                                    {['Estudiante', 'DNI', 'Email Asignado', 'Acción'].map((h, i) => (
                                        <th key={h} style={{ textAlign: h === 'Acción' ? 'center' : 'left', padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Cargando estudiantes inactivos...</td>
                                    </tr>
                                ) : inactiveStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)' }}>
                                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
                                            <p style={{ margin: 0, fontSize: '1.1rem' }}>No hay cuentas pendientes de activación</p>
                                            <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>Todos los estudiantes con correo asignado ya están activos.</p>
                                        </td>
                                    </tr>
                                ) : inactiveStudents.map((s, i) => (
                                    <tr
                                        key={s.id}
                                        style={{
                                            borderBottom: '1px solid var(--border)',
                                            backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--surface-hover)',
                                            transition: 'background 0.15s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.05)'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = i % 2 === 0 ? 'transparent' : 'var(--surface-hover)'}
                                    >
                                        <td style={{ padding: '0.85rem 1rem', fontWeight: '500', color: 'var(--text)' }}>
                                            {s.lastNames}, {s.names}
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{s.dni}</td>
                                        <td style={{ padding: '0.85rem 1rem' }}>
                                            <span style={{ fontSize: '0.9rem', color: 'var(--text)' }}>{s.email}</span>
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                                            <button
                                                className="btn btn-primary"
                                                style={{
                                                    padding: '0.4rem 1rem',
                                                    fontSize: '0.85rem',
                                                    backgroundColor: 'var(--success)',
                                                    borderColor: 'var(--success)',
                                                    opacity: activating === s.id ? 0.7 : 1
                                                }}
                                                onClick={() => handleActivate(s)}
                                                disabled={!!activating}
                                            >
                                                {activating === s.id ? 'Activando...' : '✨ Activar Cuenta'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {!loading && inactiveStudents.length > 0 && (
                        <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.85rem', backgroundColor: 'var(--surface)' }}>
                            Mostrando {inactiveStudents.length} estudiante{inactiveStudents.length !== 1 ? 's' : ''} para activar
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherActivationsPage;