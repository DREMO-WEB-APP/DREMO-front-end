import { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Toast from '../components/ui/Toast';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);

    const showNotification = useCallback((message, type = 'info') => {
        setNotification({ message, type, id: Date.now() });
    }, []);

    const closeNotification = useCallback(() => {
        setNotification(null);
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            {notification && (
                <Toast
                    key={notification.id}
                    message={notification.message}
                    type={notification.type}
                    onClose={closeNotification}
                />
            )}
        </NotificationContext.Provider>
    );
};

NotificationProvider.propTypes = {
    children: PropTypes.node.isRequired
};
