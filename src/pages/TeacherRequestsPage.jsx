import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import profileService from '../services/profileService';
import studentService from '../services/studentService';

const TeacherRequestsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const [profile, setProfile] = useState(null);
    const [requestsGrouped, setRequestsGrouped] = useState([]); // { student, request }
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null); // { student, request }
    const [comment, setComment] = useState('');
    const [reviewing, setReviewing] = useState(false); // 'APPROVED' | 'REJECTED' | false

    const loadData = async () => {
        if (!user?.profileId) return;
        setLoading(true);
        try {
            const teacherProfile = await profileService.getProfileByRole(user.profileId, 'TEACHER');
            setProfile(teacherProfile);

            if (teacherProfile?.instituteId) {
                const list = await studentService.getStudentsByInstitute(teacherProfile.instituteId);

                // Fetch requests for all students
                const results = await Promise.allSettled(
                    list.map(s => studentService.getEmailRequestStatus(s.id))
                );

                // Filter only PENDING requests and pair them with the student data
                const pending = [];
                results.forEach((r, idx) => {
                    if (r.status === 'fulfilled' && r.value?.status === 'PENDING') {
                        pending.push({
                            student: list[idx],
                            request: r.value
                        });
                    }
                });

                // Sort oldest requests first 
                pending.sort((a, b) => new Date(a.request.requestDate) - new Date(b.request.requestDate));
                setRequestsGrouped(pending);
            }
        } catch (err) {
            console.error('Error loading requests data', err);
            showNotification('Error al cargar las solicitudes', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [user]);

    const handleReview = async (response) => {
        if (!selectedItem || !profile?.id) return;
        setReviewing(response);
        try {
            await studentService.reviewRequest(selectedItem.request.id, profile.id, response, comment);
            showNotification(
                response === 'APPROVED' ? 'Solicitud aprobada correctamente' : 'Solicitud rechazada',
                response === 'APPROVED' ? 'success' : 'info'
            );
            setSelectedItem(null);
            setComment('');
            loadData(); // refresh list
        } catch (err) {
            console.error('Review failed', err);
            showNotification('Error al procesar la solicitud', 'error');
        } finally {
            setReviewing(false);
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
                        <h1 style={{ margin: 0, color: 'var(--text)' }}>Solicitudes de Email</h1>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Gestión de peticiones pendientes
                        </p>
                    </div>
                </div>

                <div className="dashboard-grid" style={{ flex: 1, display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(350px, 400px)', gap: '1.5rem', alignItems: 'start' }}>
                    <style>{`
                        @media (max-width: 900px) { .dashboard-grid { grid-template-columns: 1fr !important; } }
                    `}</style>

                    {/* Left Panel: List of Requests */}
                    <div className="card animate-fade-in" style={{ padding: 0, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text)' }}>Pendientes ({requestsGrouped.length})</h3>
                        </div>

                        {loading ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando solicitudes...</div>
                        ) : requestsGrouped.length === 0 ? (
                            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                                <p style={{ margin: 0, fontSize: '1.1rem' }}>No hay solicitudes pendientes</p>
                                <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>Estás al día con todas las peticiones de tus estudiantes.</p>
                            </div>
                        ) : (
                            <div style={{ overflowY: 'auto' }}>
                                {requestsGrouped.map((item) => (
                                    <div
                                        key={item.request.id}
                                        onClick={() => { setSelectedItem(item); setComment(''); }}
                                        style={{
                                            padding: '1rem 1.5rem',
                                            borderBottom: '1px solid var(--border)',
                                            cursor: 'pointer',
                                            backgroundColor: selectedItem?.request.id === item.request.id ? 'rgba(99,102,241,0.08)' : 'transparent',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={e => { if (selectedItem?.request.id !== item.request.id) e.currentTarget.style.backgroundColor = 'var(--surface-hover)' }}
                                        onMouseLeave={e => { if (selectedItem?.request.id !== item.request.id) e.currentTarget.style.backgroundColor = 'transparent' }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                                            <span style={{ fontWeight: '500', color: 'var(--text)' }}>{item.student.names} {item.student.lastNames}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {new Date(item.request.requestDate).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>DNI: {item.student.dni}</span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--warning)', fontWeight: '600', backgroundColor: 'rgba(234,179,8,0.15)', padding: '0.1rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                                                En espera
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Review Interface */}
                    <div className="card animate-fade-in" style={{ animationDelay: '0.1s', position: 'sticky', top: '2rem' }}>
                        {selectedItem ? (
                            <>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    📨 Revisar Petición
                                </h3>

                                <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estudiante</label>
                                        <p style={{ margin: '0.25rem 0 0', fontWeight: '500', fontSize: '1.1rem' }}>{selectedItem.student.names} {selectedItem.student.lastNames}</p>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Identificación</label>
                                        <p style={{ margin: '0.25rem 0 0', fontFamily: 'monospace', fontSize: '1rem' }}>{selectedItem.student.dni}</p>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha de Solicitud</label>
                                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.95rem' }}>
                                            {new Date(selectedItem.request.requestDate).toLocaleString('es-PE', {
                                                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-md)' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                        Comentario para el estudiante (Opcional)
                                    </label>
                                    <textarea
                                        className="input"
                                        rows={3}
                                        placeholder="Ej: Aprobado. Tu correo estará listo pronto."
                                        value={comment}
                                        onChange={e => setComment(e.target.value)}
                                        style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', fontSize: '0.9rem' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        className="btn btn-primary"
                                        style={{ flex: 1, backgroundColor: 'var(--success)', borderColor: 'var(--success)', opacity: reviewing ? 0.7 : 1 }}
                                        onClick={() => handleReview('APPROVED')}
                                        disabled={!!reviewing}
                                    >
                                        {reviewing === 'APPROVED' ? 'Procesando...' : '✅ Aprobar'}
                                    </button>
                                    <button
                                        className="btn btn-outline"
                                        style={{ flex: 1, borderColor: 'var(--error)', color: 'var(--error)', opacity: reviewing ? 0.7 : 1 }}
                                        onClick={() => handleReview('REJECTED')}
                                        disabled={!!reviewing}
                                    >
                                        {reviewing === 'REJECTED' ? 'Procesando...' : '❌ Rechazar'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <span style={{ fontSize: '2.5rem', opacity: 0.5, display: 'block', marginBottom: '1rem' }}>👆</span>
                                <p style={{ margin: 0 }}>Selecciona una solicitud de la lista para ver los detalles y procesarla.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherRequestsPage;
