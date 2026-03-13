import { useState } from 'react';
import { createPortal } from 'react-dom';

const StatusCard = ({ status }) => {
    const [showInfo, setShowInfo] = useState(false);
    const isActive = status === 'ACTIVE';

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
            onClick={() => setShowInfo(false)}
        >
            <div
                className="card"
                style={{
                    maxWidth: '400px',
                    padding: '2rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    animation: 'slideIn 0.3s ease-out'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text)' }}>Información de Estado</h3>
                    <button
                        onClick={() => setShowInfo(false)}
                        className="btn btn-outline"
                        style={{ padding: '0.25rem 0.5rem', border: 'none', fontSize: '1.25rem', lineHeight: 1 }}
                    >
                        &times;
                    </button>
                </div>

                <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--success)', marginBottom: '0.5rem' }}>✅ Activo</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        Tu cuenta está verificada, lo que significa que tu correo institucional ya fue creado en Google y está funcionando correctamente.
                    </p>

                    <h4 style={{ fontSize: '1rem', color: 'var(--error)', marginBottom: '0.5rem' }}>❌ Inactivo</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Tu cuenta aún no ha sido activada. Incluso si ya tienes un correo asignado, este aún no ha sido creado en Google y deberá ser activado por tu docente.
                    </p>
                </div>

                <button
                    onClick={() => setShowInfo(false)}
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

    return (
        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text)' }}>Estado de Cuenta</h3>
                <button
                    onClick={() => setShowInfo(true)}
                    className="btn btn-outline"
                    title="¿Qué significa esto?"
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

            <span style={{
                padding: '0.5rem 1.5rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: isActive ? 'var(--success)' : 'var(--error)',
                fontSize: '1.1rem',
                fontWeight: '700',
                marginBottom: '1.5rem',
                border: `1px solid ${isActive ? 'var(--success)' : 'var(--error)'}`,
                boxShadow: isActive ? '0 0 15px rgba(34, 197, 94, 0.3)' : 'none'
            }}>
                {isActive ? 'Activo' : 'Inactivo'}
            </span>

            {showInfo && <InfoModal />}
        </div>
    );
};

export default StatusCard;
