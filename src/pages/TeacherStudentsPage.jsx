import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import profileService from '../services/profileService';
import studentService from '../services/studentService';
import { useNotification } from '../context/NotificationContext';

// ── Status Badge ───────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => (
    <span style={{
        padding: '0.2rem 0.65rem',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.78rem',
        fontWeight: '600',
        backgroundColor: status === 'ACTIVE' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
        color: status === 'ACTIVE' ? 'var(--success)' : 'var(--error)',
        border: `1px solid ${status === 'ACTIVE' ? 'var(--success)' : 'var(--error)'}`,
    }}>
        {status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
    </span>
);

// ── Request Status Indicator ───────────────────────────────────────────────
const requestConfig = {
    PENDING: { color: 'var(--warning)', bg: 'rgba(234,179,8,0.15)', icon: '🕐', label: 'Pendiente' },
    APPROVED: { color: 'var(--success)', bg: 'rgba(34,197,94,0.15)', icon: '✅', label: 'Aprobado' },
    REJECTED: { color: 'var(--error)', bg: 'rgba(239,68,68,0.15)', icon: '❌', label: 'Rechazado' },
};

const RequestStatusBadge = ({ status }) => {
    const cfg = requestConfig[status] || requestConfig.PENDING;
    return (
        <span style={{ padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: '600', backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}` }}>
            {cfg.icon} {cfg.label}
        </span>
    );
};

// ── Student Detail Modal ───────────────────────────────────────────────────
const StudentModal = ({ student, onClose }) => {
    if (!student) return null;

    const InfoRow = ({ label, value, mono }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
            <span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text)', fontFamily: mono ? 'monospace' : 'inherit' }}>{value || '—'}</span>
        </div>
    );

    return createPortal(
        <div
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
            onClick={onClose}
        >
            <div
                className="card"
                style={{ width: '100%', maxWidth: '500px', padding: 0, overflow: 'hidden', animation: 'slideIn 0.25s ease-out' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-hover)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '1.2rem', flexShrink: 0 }}>
                            {(student.names?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text)' }}>{student.names} {student.lastNames}</h3>
                            <StatusBadge status={student.userStatus} />
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: 'var(--text-muted)', lineHeight: 1, padding: '0.2rem' }}>×</button>
                </div>

                {/* Body */}
                <div style={{ overflowY: 'auto', maxHeight: '70vh' }}>
                    {/* Student Info */}
                    <InfoRow label="Nombres" value={student.names} />
                    <InfoRow label="Apellidos" value={student.lastNames} />
                    <InfoRow label="DNI" value={student.dni} mono />
                    <InfoRow label="Institución Educativa" value={student.institute} />

                    {/* Email */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email Institucional</span>
                        {student.email ? (
                            <span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text)' }}>{student.email}</span>
                        ) : (
                            <span style={{ padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', backgroundColor: 'rgba(234,179,8,0.15)', color: 'var(--warning)', border: '1px solid var(--warning)', width: 'fit-content' }}>Sin email asignado</span>
                        )}
                    </div>

                </div>

                {/* Footer */}
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem' }}>
                    <button onClick={onClose} className="btn btn-outline">Cerrar</button>
                </div>
            </div>
            <style>{`@keyframes slideIn { from { transform: translateY(-16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
        </div>,
        document.body
    );
};

// ── Main Page ──────────────────────────────────────────────────────────────
const TeacherStudentsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [students, setStudents] = useState([]);
    const [pendingSet, setPendingSet] = useState(new Set()); // studentIds with PENDING requests
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [search, setSearch] = useState('');

    const loadData = async () => {
        if (!user?.profileId) return;
        try {
            const teacherProfile = await profileService.getProfileByRole(user.profileId, 'TEACHER');
            setProfile(teacherProfile);
            if (teacherProfile?.instituteId) {
                const list = await studentService.getStudentsByInstitute(teacherProfile.instituteId);
                setStudents(list);
            }
        } catch (err) {
            console.error('Error loading data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [user]);

    const filtered = students.filter(s => {
        const q = search.toLowerCase();
        return (
            s.dni?.toLowerCase().includes(q) ||
            s.names?.toLowerCase().includes(q) ||
            s.lastNames?.toLowerCase().includes(q) ||
            s.email?.toLowerCase().includes(q)
        );
    });

    const activeCount = students.filter(s => s.userStatus === 'ACTIVE').length;
    const withEmailCount = students.filter(s => s.email).length;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <DashboardNavbar />
            <div className="container" style={{ padding: '2rem', flex: 1 }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <button onClick={() => navigate('/email-app/teacher/dashboard')} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem' }}>
                        ← Volver
                    </button>
                    <div>
                        <h1 style={{ margin: 0, color: 'var(--text)' }}>Gestión de Estudiantes</h1>
                        {profile?.institute && (
                            <p style={{ margin: '0.2rem 0 0', fontSize: '0.9rem', color: 'var(--primary)' }}>{profile.institute}</p>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>Cargando estudiantes...</div>
                ) : (
                    <>
                        {/* Stats Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', margin: '1.5rem 0' }}>
                            {[
                                { label: 'Total', value: students.length, color: 'var(--primary)' },
                                { label: 'Activos', value: activeCount, color: 'var(--success)' },
                                { label: 'Inactivos', value: students.length - activeCount, color: 'var(--error)' },
                                { label: 'Con Email', value: withEmailCount, color: 'var(--info)' },
                            ].map(stat => (
                                <div key={stat.label} className="card animate-fade-in" style={{ textAlign: 'center', padding: '1rem' }}>
                                    <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: stat.color }}>{stat.value}</p>
                                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
                            <input
                                type="text"
                                className="input"
                                placeholder="Buscar por nombre, apellido, DNI o email..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ width: '100%', boxSizing: 'border-box' }}
                            />
                        </div>

                        {/* Table */}
                        <div className="card animate-fade-in" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid var(--border)', backgroundColor: 'var(--surface-hover)' }}>
                                            {['DNI', 'Nombre Completo', 'Email Institucional', 'Estado'].map((h, i) => (
                                                <th key={h} style={{ textAlign: i === 3 ? 'center' : 'left', padding: '0.85rem 1rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                                    {search ? 'No se encontraron resultados.' : 'No hay estudiantes registrados.'}
                                                </td>
                                            </tr>
                                        ) : filtered.map((s, i) => (
                                            <tr
                                                key={s.id}
                                                onClick={() => setSelectedStudent(s)}
                                                style={{
                                                    borderBottom: '1px solid var(--border)',
                                                    cursor: 'pointer',
                                                    backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--surface-hover)',
                                                    transition: 'background 0.15s',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.08)'}
                                                onMouseLeave={e => e.currentTarget.style.backgroundColor = i % 2 === 0 ? 'transparent' : 'var(--surface-hover)'}
                                            >
                                                <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{s.dni}</td>
                                                <td style={{ padding: '0.85rem 1rem', fontWeight: '500', color: 'var(--text)' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                        {s.names} {s.lastNames}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem' }}>
                                                    {s.email ? (
                                                        <span style={{ color: 'var(--text)', fontSize: '0.88rem' }}>{s.email}</span>
                                                    ) : (
                                                        <span style={{ padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', backgroundColor: 'rgba(234,179,8,0.15)', color: 'var(--warning)', border: '1px solid var(--warning)' }}>Sin email</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                                                    <StatusBadge status={s.userStatus} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {filtered.length > 0 && (
                                <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    Mostrando {filtered.length} de {students.length} estudiante{students.length !== 1 ? 's' : ''}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <StudentModal
                student={selectedStudent}
                teacherProfileId={profile?.id}
                onClose={() => setSelectedStudent(null)}
                onRequestReviewed={loadData}
            />
        </div>
    );
};

export default TeacherStudentsPage;
