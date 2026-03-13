import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const userData = await authService.getCurrentUser();
                // Map 'id' from /me to 'profileId' (accountId) to match previous logic
                setUser({
                    ...userData,
                    profileId: userData.id
                });
            } catch (error) {
                // If 401/403 or network error, assume not logged in
                console.log("No active session:", error.message);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, []);

    const login = (userData) => {
        // Determine accountId source: profileId (from login) or id (from me)
        const accountId = userData.profileId || userData.id;
        setUser({
            ...userData,
            profileId: accountId
        });
    };

    const logout = () => {
        setUser(null);
    };

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'var(--background)',
                color: 'var(--text)'
            }}>
                Cargando sesión...
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired
};
