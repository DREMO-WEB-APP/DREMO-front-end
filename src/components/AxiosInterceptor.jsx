import { useEffect, useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import { setupInterceptors } from '../services/api';

const AxiosInterceptor = ({ children }) => {
    const { showNotification } = useNotification();
    const [isSet, setIsSet] = useState(false);

    useEffect(() => {
        setupInterceptors(showNotification);
        setIsSet(true);
    }, [showNotification]);

    return isSet ? children : null;
};

export default AxiosInterceptor;
