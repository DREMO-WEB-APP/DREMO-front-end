import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import studentService from '../../services/studentService';
import { useNotification } from '../../context/NotificationContext';

const EmailCard = ({ email, studentId }) => {
    const [matches, setMatches] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // States for No-Email flow
    const [requestStatus, setRequestStatus] = useState(null);
    const [checkingRequest, setCheckingRequest] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requesting, setRequesting] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);

    const { showNotification } = useNotification();

    // 1. Handle Body Scroll for Modals
    useEffect(() => {
        if (showPasswordModal || showRequestModal || showInfoModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [showPasswordModal, showRequestModal, showInfoModal]);

    // 2. Fetch Email Details (Existing Logic)
    useEffect(() => {
        if (!email) return;
        const fetchEmailDetails = async () => {
            setLoading(true);
            try {
                const data = await studentService.getEmailDetails(email);
                setMatches(data);
            } catch (error) {
                console.error("Failed to fetch email details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEmailDetails();
    }, [email]);

    // 3. Fetch Request Status (always, regardless of email)
    useEffect(() => {
        if (!studentId) return;

        const fetchRequestStatus = async () => {
            setCheckingRequest(true);
            try {
                const data = await studentService.getEmailRequestStatus(studentId);
                if (data && data.status) {
                    setRequestStatus(data);
                }
            } catch (error) {
                console.log("No request found or error checking status.");
            } finally {
                setCheckingRequest(false);
            }
        };
        fetchRequestStatus();
    }, [studentId]);


    // --- Handlers ---

    const copyToClipboard = () => {
        if (matches?.encryptedPassword) {
            navigator.clipboard.writeText(matches.encryptedPassword);
            showNotification('Contraseña copiada al portapapeles', 'success');
        }
    };

    const maskPassword = (password) => {
        if (!password) return '';
        if (password.length <= 4) return '*'.repeat(password.length);
        return password.substring(0, 2) + '*'.repeat(password.length - 2);
    };

    const handleCreateRequest = async () => {
        if (!studentId) return;
        setRequesting(true);
        try {
            const data = await studentService.createEmailRequest(studentId);
            setRequestStatus(data);
            showNotification('Solicitud de email creada exitosamente', 'success');
            setShowRequestModal(false);
        } catch (error) {
            console.error("Failed to create request", error);
            // Error handling usually managed by interceptor, but we assume success if no error thrown
        } finally {
            setRequesting(false);
        }
    };

    // --- Request Status Component ---
    const statusStyles = {
        PENDING: { color: 'var(--warning)', bg: 'rgba(234,179,8,0.12)', border: 'var(--warning)', icon: '🕐', label: 'Pendiente — en revisión' },
        APPROVED: { color: 'var(--success)', bg: 'rgba(34,197,94,0.12)', border: 'var(--success)', icon: '✅', label: 'Aprobada' },
        REJECTED: { color: 'var(--error)', bg: 'rgba(239,68,68,0.12)', border: 'var(--error)', icon: '❌', label: 'Rechazada' },
    };
    const RequestStatusSection = ({ request }) => {
        const cfg = statusStyles[request.status] || statusStyles.PENDING;
        const reviewerName = request.reviewedBy
            ? `${request.reviewedBy.names} ${request.reviewedBy.lastNames}`
            : null;
        return (
            <div style={{ borderRadius: 'var(--radius-md)', border: `1px solid ${cfg.border}`, overflow: 'hidden', textAlign: 'left' }}>
                <div style={{ backgroundColor: cfg.bg, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>{cfg.icon}</span>
                    <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: '600', color: cfg.color, fontSize: '0.9rem' }}>Solicitud de Email — {cfg.label}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Solicitado: {new Date(request.requestDate).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                            {request.reviewedAt && request.status !== 'PENDING' && (
                                <> · Revisado: {new Date(request.reviewedAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}</>
                            )}
                        </p>
                        {reviewerName && request.status !== 'PENDING' && (
                            <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                Revisado por: <strong style={{ color: cfg.color }}>{reviewerName}</strong>
                            </p>
                        )}
                    </div>
                </div>
                {request.comment && (
                    <div style={{ padding: '0.65rem 1rem', borderTop: `1px solid ${cfg.border}`, backgroundColor: 'var(--surface-hover)' }}>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Comentario del docente</p>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text)', fontStyle: 'italic' }}>"{request.comment}"</p>
                    </div>
                )}
            </div>
        );
    };

    // Info Modal Component
    const InfoModal = () => createPortal(
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease-out'
        }}
            onClick={() => setShowInfoModal(false)}
        >
            <div
                className="card"
                style={{
                    maxWidth: '450px',
                    padding: '2rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    animation: 'slideIn 0.3s ease-out'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text)' }}>Email Institucional</h3>
                    <button
                        onClick={() => setShowInfoModal(false)}
                        className="btn btn-outline"
                        style={{ padding: '0.25rem 0.5rem', border: 'none', fontSize: '1.25rem', lineHeight: 1 }}
                    >
                        &times;
                    </button>
                </div>

                <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>📧 ¿Qué es?</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        Tu email institucional es una cuenta oficial proporcionada por tu institución educativa.
                        Es tu identidad digital para acceder a servicios académicos y comunicarte oficialmente.
                    </p>

                    <h4 style={{ fontSize: '1rem', color: 'var(--warning)', marginBottom: '0.5rem' }}>🔐 Contraseña Encriptada</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        La contraseña mostrada está cifrada por seguridad. Puedes verla y copiarla cuando necesites
                        iniciar sesión en tu cuenta de correo institucional.
                    </p>

                    <h4 style={{ fontSize: '1rem', color: 'var(--info)', marginBottom: '0.5rem' }}>📝 Solicitud</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Si aún no tienes un email asignado, puedes solicitarlo desde este panel.
                        Tu institución revisará y procesará tu solicitud.
                    </p>
                </div>

                <button
                    onClick={() => setShowInfoModal(false)}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '1rem' }}
                >
                    Entendido
                </button>
            </div>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>,
        document.body
    );

    // --- Render Logic ---

    // Case 1: Loading initial state
    if (loading || checkingRequest) {
        return (
            <div className="card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <p>Cargando información...</p>
            </div>
        );
    }

    // Case 2: No Email Logic
    if (!email) {
        return (
            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--primary)' }}>Email Institucional</h3>
                    <button
                        onClick={() => setShowInfoModal(true)}
                        className="btn btn-outline"
                        title="¿Qué es el email institucional?"
                        style={{
                            padding: '0',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            color: 'var(--info)',
                            borderColor: 'var(--info)'
                        }}
                    >
                        ?
                    </button>
                </div>


                {requestStatus ? (
                    // Subcase 2a: Request Exists
                    <div className="animate-fade-in" style={{ width: '100%' }}>
                        {requestStatus.status === 'PENDING' ? (
                            <p style={{ marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                ✉️ Ya le pediste a tu docente que te cree un correo. ¡Espera a que lo revise!
                            </p>
                        ) : (
                            <p style={{ marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Tu docente revisó tu solicitud de correo institucional.
                            </p>
                        )}
                        <RequestStatusSection request={requestStatus} />
                    </div>
                ) : (
                    // Subcase 2b: No Request — friendly instructions
                    <div className="animate-fade-in">
                        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📭</div>
                        <p style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--text)', marginBottom: '0.5rem' }}>
                            Aún no tienes un correo institucional
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                            Para obtener tu correo, <strong>pídele a tu docente</strong> que cree tu cuenta.
                            Cuando lo haga, aparecerá aquí.
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.4 }}>
                            También puedes enviarle una solicitud directamente haciendo clic en el botón.
                        </p>
                        <button
                            onClick={() => setShowRequestModal(true)}
                            className="btn btn-primary"
                        >
                            📨 Enviar Solicitud al Docente
                        </button>
                    </div>
                )}

                {/* Confirm Request Modal */}
                {showRequestModal && createPortal(
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 99999,
                        backdropFilter: 'blur(8px)'
                    }}>
                        <div className="card animate-fade-in" style={{ width: '90%', maxWidth: '400px', padding: '2rem', position: 'relative' }}>
                            <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Confirmar Solicitud</h3>
                            <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-muted)' }}>
                                ¿Estás seguro que deseas solicitar un email institucional? Esta acción notificará al administrador.
                            </p>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={handleCreateRequest}
                                    className="btn btn-primary"
                                    disabled={requesting}
                                    style={{ flex: 1 }}
                                >
                                    {requesting ? 'Solicitando...' : 'Confirmar'}
                                </button>
                                <button
                                    onClick={() => setShowRequestModal(false)}
                                    className="btn btn-outline"
                                    disabled={requesting}
                                    style={{ flex: 1 }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

                {/* Info Modal */}
                {showInfoModal && <InfoModal />}
            </div>
        );
    }

    // Case 3: Has Email (Existing Logic)
    return (
        <div className="card" style={{ height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--primary)' }}>Email Institucional</h3>
                <button
                    onClick={() => setShowInfoModal(true)}
                    className="btn btn-outline"
                    title="¿Qué es el email institucional?"
                    style={{
                        padding: '0',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        color: 'var(--info)',
                        borderColor: 'var(--info)'
                    }}
                >
                    ?
                </button>
            </div>


            <p style={{ fontSize: '1.1rem', marginBottom: '0.25rem', wordBreak: 'break-all', fontWeight: '600', color: 'var(--text)' }}>
                📧 {email}
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Este es tu correo de colegio. Úsalo para acceder a tus servicios de google.
            </p>

            {matches && (
                <button
                    onClick={() => {
                        setShowPasswordModal(true);
                        setIsPasswordVisible(false);
                    }}
                    className="btn btn-outline"
                    style={{ fontSize: '0.9rem', width: '100%', marginBottom: requestStatus ? '1rem' : 0 }}
                >
                    🔑 Ver Contraseña Temporal
                </button>
            )}

            {/* Request status for students who already have email */}
            {requestStatus && (
                <div style={{ marginTop: '1rem' }}>
                    <RequestStatusSection request={requestStatus} />
                </div>
            )}

            {showPasswordModal && matches && createPortal(
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 99999,
                    backdropFilter: 'blur(8px)'
                }}>
                    <div className="card animate-fade-in" style={{ width: '90%', maxWidth: '400px', padding: '2rem', position: 'relative', margin: 'auto', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>🔑 Tu Contraseña Temporal</h3>

                        {matches.encryptedPassword === undefined || matches.encryptedPassword === null ? (
                            // ── No-password case: email already existed ────────────
                            <>
                                <div style={{
                                    backgroundColor: 'rgba(99,102,241,0.08)',
                                    border: '1px solid rgba(99,102,241,0.3)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '1.25rem',
                                    textAlign: 'center',
                                    marginBottom: '1.5rem'
                                }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>ℹ️</div>
                                    <p style={{ margin: '0 0 0.5rem', fontWeight: '600', color: 'var(--text)', fontSize: '0.95rem' }}>
                                        Este correo ya existía previamente
                                    </p>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                        Tu cuenta de Google ya estaba creada antes de ser registrada aquí,
                                        por lo que no se generó una contraseña temporal.
                                        Inicia sesión en tu correo con tu <strong>contraseña habitual</strong>.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowPasswordModal(false)}
                                    className="btn btn-primary"
                                    style={{ width: '100%' }}
                                >
                                    Entendido
                                </button>
                            </>
                        ) : (
                            // ── Normal case: show & copy password ──────────────────
                            <>
                                <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                                    Esta contraseña es temporal asignada por el sistema para que puedas ingresar a tu correo por primera vez.
                                    ¡Cópiala y guárdala en un lugar seguro!
                                </p>

                                <div style={{
                                    backgroundColor: 'var(--background)',
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: '1.5rem',
                                    border: '1px solid var(--border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '0.5rem'
                                }}>
                                    <span style={{ fontFamily: 'monospace', wordBreak: 'break-all', flex: 1 }}>
                                        {isPasswordVisible ? matches.encryptedPassword : maskPassword(matches.encryptedPassword)}
                                    </span>
                                    <button
                                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '0.25rem',
                                            fontSize: '1.2rem',
                                            color: 'var(--text-muted)',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                        aria-label={isPasswordVisible ? "Ocultar contraseña" : "Ver contraseña"}
                                    >
                                        {isPasswordVisible ? '🙈' : '👁️'}
                                    </button>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        onClick={copyToClipboard}
                                        className="btn btn-primary"
                                        style={{ flex: 1 }}
                                    >
                                        Copiar
                                    </button>
                                    <button
                                        onClick={() => setShowPasswordModal(false)}
                                        className="btn btn-outline"
                                        style={{ flex: 1 }}
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>,
                document.body
            )}

            {/* Info Modal */}
            {showInfoModal && <InfoModal />}
        </div>
    );
};

export default EmailCard;
