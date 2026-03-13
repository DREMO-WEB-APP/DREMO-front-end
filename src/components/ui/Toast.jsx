import { useEffect } from 'react';
import PropTypes from 'prop-types';

const Toast = ({ message, type = 'info', onClose, duration = 5000 }) => {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const bgColors = {
        success: 'var(--success)',
        error: 'var(--error)',
        warning: 'var(--warning)',
        info: 'var(--info)'
    };

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            backgroundColor: 'var(--surface)',
            borderLeft: `4px solid ${bgColors[type]}`,
            color: 'var(--text)',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            zIndex: 9999,
            animation: 'slideIn 0.3s ease-out',
            maxWidth: '400px'
        }}>
            <span style={{
                color: bgColors[type],
                fontWeight: 'bold',
                fontSize: '1.2rem'
            }}>
                {icons[type]}
            </span>
            <p style={{ margin: 0, fontSize: '0.95rem' }}>{message}</p>
            <button
                onClick={onClose}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    marginLeft: 'auto',
                    padding: '0.25rem'
                }}
            >
                ✕
            </button>
            <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
        </div>
    );
};

Toast.propTypes = {
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
    onClose: PropTypes.func.isRequired,
    duration: PropTypes.number
};

export default Toast;
