import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import adminService from '../services/adminService';
import { useNotification } from '../context/NotificationContext';

// Eye icon helpers
const EyeOpen = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
);
const EyeClosed = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

const InputField = ({ label, name, type = 'text', value, onChange, placeholder, required, pattern, title, maxLength, minLength }) => {
    const [showPwd, setShowPwd] = useState(false);
    const isPassword = type === 'password';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {label}
            </label>
            <div style={{ position: 'relative' }}>
                <input
                    type={isPassword && showPwd ? 'text' : type}
                    name={name}
                    className="input"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    pattern={pattern}
                    title={title}
                    maxLength={maxLength}
                    minLength={minLength}
                    style={{ width: '100%', boxSizing: 'border-box', paddingRight: isPassword ? '2.75rem' : undefined }}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPwd(v => !v)}
                        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: 0 }}
                    >
                        {showPwd ? <EyeClosed /> : <EyeOpen />}
                    </button>
                )}
            </div>
        </div>
    );
};

const TeacherSignupPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const [isValidating, setIsValidating] = useState(true);
    const [isValid, setIsValid] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        username: '', password: '', names: '', lastNames: '', dni: ''
    });

    useEffect(() => {
        const validateToken = async () => {
            if (!token) { setIsValidating(false); return; }
            try {
                const response = await adminService.verifyTeacherInvitation(token);
                if (response === 'valid') setIsValid(true);
            } catch (err) {
                console.error('Invalid token', err);
            } finally {
                setIsValidating(false);
            }
        };
        validateToken();
    }, [token]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await adminService.acceptTeacherInvitation({ invitationToken: token, ...formData });
            setSuccess(true);
        } catch (err) {
            console.error('Signup failed', err);
            if (err.response?.data?.message) {
                showNotification(err.response.data.message, 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    // ── Loading state ──────────────────────────────────────────────────
    if (isValidating) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 1.25rem' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>Validando invitación...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    // ── Invalid token ──────────────────────────────────────────────────
    if (!isValid) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', backgroundColor: 'var(--background)' }}>
                <div className="card animate-fade-in" style={{ maxWidth: '420px', width: '100%', textAlign: 'center', border: '1px solid var(--error)', padding: '2.5rem 2rem' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.25rem' }}>
                        🚫
                    </div>
                    <h2 style={{ color: 'var(--error)', marginBottom: '0.75rem', fontSize: '1.35rem' }}>Invitación inválida</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6', fontSize: '0.9rem' }}>
                        El enlace que has recibido no es válido o ya expiró.<br />
                        Solicita a tu administrador que genere uno nuevo.
                    </p>
                    <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => navigate('/email-app/login')}>
                        Ir al inicio de sesión
                    </button>
                </div>
            </div>
        );
    }

    // ── Success state ──────────────────────────────────────────────────
    if (success) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', backgroundColor: 'var(--background)' }}>
                <div className="card animate-fade-in" style={{ maxWidth: '420px', width: '100%', textAlign: 'center', border: '1px solid var(--success)', padding: '2.5rem 2rem' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.25rem' }}>
                        🎉
                    </div>
                    <h2 style={{ color: 'var(--success)', marginBottom: '0.75rem', fontSize: '1.35rem' }}>¡Cuenta creada!</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6', fontSize: '0.9rem' }}>
                        Tu cuenta de docente ha sido registrada exitosamente. Ya puedes iniciar sesión con tus credenciales.
                    </p>
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/login')}>
                        Iniciar Sesión →
                    </button>
                </div>
            </div>
        );
    }

    // ── Signup form ────────────────────────────────────────────────────
    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
            <div className="animate-fade-in" style={{ width: '100%', maxWidth: '520px' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--primary), #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', margin: '0 auto 1.25rem', boxShadow: '0 8px 20px rgba(99,102,241,0.35)' }}>
                        👨‍🏫
                    </div>
                    <h1 style={{ margin: '0 0 0.4rem', fontSize: '1.75rem', fontWeight: '700', color: 'var(--text)' }}>
                        Registro de Docente
                    </h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        Completa tus datos para acceder a la plataforma
                    </p>
                </div>

                {/* Form card */}
                <div className="card" style={{ padding: '2rem' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                        {/* Names row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <InputField label="Nombres" name="names" value={formData.names} onChange={handleChange} placeholder="Ej: María" required />
                            <InputField label="Apellidos" name="lastNames" value={formData.lastNames} onChange={handleChange} placeholder="Ej: Pérez" required />
                        </div>

                        <InputField
                            label="DNI"
                            name="dni"
                            value={formData.dni}
                            onChange={handleChange}
                            placeholder="8 dígitos"
                            required
                            pattern="[0-9]{8}"
                            title="El DNI debe contener exactamente 8 números"
                            maxLength="8"
                        />

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
                            CREDENCIALES DE ACCESO
                            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
                        </div>

                        <InputField label="Nombre de Usuario" name="username" value={formData.username} onChange={handleChange} placeholder="Ej: maria.perez" required />
                        <InputField label="Contraseña" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Mínimo 6 caracteres" required minLength="6" />

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ padding: '0.9rem', fontSize: '1rem', marginTop: '0.25rem' }}
                        >
                            {loading ? 'Creando cuenta...' : 'Completar Registro ✨'}
                        </button>
                    </form>
                </div>

                {/* Footer link */}
                <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/email-app/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
                        Iniciar sesión
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default TeacherSignupPage;
