import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import instituteService from '../../services/instituteService';
import { useNotification } from '../../context/NotificationContext';
import { INSTITUTE_LEVELS } from '../../constants/instituteLevels';

const RegisterForm = () => {
    // Student Data
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        names: '',
        lastNames: '',
        dni: ''
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Institute Search State
    const [instituteSearch, setInstituteSearch] = useState('');
    const [selectedLevel, setSelectedLevel] = useState(''); // Default to All
    const [institutes, setInstitutes] = useState([]);
    const [selectedInstitute, setSelectedInstitute] = useState(null);
    const [searching, setSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    // Debounce search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (instituteSearch.trim().length > 2) {
                handleSearchInstitutes();
            } else if (instituteSearch.trim().length === 0) {
                setInstitutes([]);
                setHasSearched(false);
            }
        }, 600);

        return () => clearTimeout(delayDebounceFn);
    }, [instituteSearch, selectedLevel]);

    const handleSearchInstitutes = async () => {
        setSearching(true);
        setHasSearched(true);
        try {
            const data = await instituteService.searchInstitutes(instituteSearch, selectedLevel);
            setInstitutes(data);
        } catch (error) {
            console.error("Search failed", error);
            setInstitutes([]);
        } finally {
            setSearching(false);
        }
    };

    const handleSelectInstitute = (institute) => {
        setSelectedInstitute(institute);
        setInstitutes([]); // clear results to hide list
        setInstituteSearch(''); // clear search
        setHasSearched(false);
    };

    const handleClearInstitute = () => {
        setSelectedInstitute(null);
        setInstituteSearch('');
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== confirmPassword) {
            showNotification('Las contraseñas no coinciden', 'error');
            return;
        }

        if (!selectedInstitute) {
            showNotification('Debes seleccionar tu institución educativa', 'warning');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                instituteId: selectedInstitute.id
            };

            await authService.register(payload);
            showNotification('Registro exitoso. Ahora puedes iniciar sesión.', 'success');
            navigate('/email-app/login');
        } catch (error) {
            console.error('Registration error:', error);
            // Error managed by interceptor
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

    const EyeIcon = ({ visible, onClick }) => (
        <button
            type="button"
            onClick={onClick}
            style={{
                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            tabIndex="-1"
        >
            {visible ? '🙈' : '👁️'}
        </button>
    );

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', paddingBottom: '4rem' }}>
            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '600px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--secondary)' }}>Crear Cuenta de Estudiante</h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Section: Institute Selection */}
                    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary)' }}>1. Institución Educativa</h3>

                        {selectedInstitute ? (
                            <div style={{
                                padding: '1rem',
                                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                border: '1px solid var(--primary)',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <p style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{selectedInstitute.name}</p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedInstitute.address}</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedInstitute.nivMod}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleClearInstitute}
                                    className="btn btn-outline"
                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                >
                                    Cambiar
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label className="label" style={{ display: 'block', marginBottom: '0.5rem' }}>Nivel Educativo</label>
                                    <select
                                        className="input"
                                        value={selectedLevel}
                                        onChange={(e) => setSelectedLevel(e.target.value)}
                                    >
                                        <option value="">Todos los niveles</option>
                                        {Object.entries(INSTITUTE_LEVELS).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <label className="label" style={{ display: 'block', marginBottom: '0.5rem' }}>Buscar Institución</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Ej: Colegio San Martín..."
                                        value={instituteSearch}
                                        onChange={(e) => setInstituteSearch(e.target.value)}
                                    />
                                    {searching && <span style={{ position: 'absolute', right: '10px', top: '38px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Buscando...</span>}

                                    {/* Search Results Dropdown */}
                                    {hasSearched && !selectedInstitute && (
                                        <div style={{
                                            marginTop: '0.5rem',
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            border: '1px solid var(--border)',
                                            borderRadius: 'var(--radius-md)',
                                            backgroundColor: 'var(--surface)',
                                            boxShadow: 'var(--shadow-md)'
                                        }}>
                                            {institutes.length > 0 ? (
                                                institutes.map(inst => (
                                                    <div
                                                        key={inst.id}
                                                        onClick={() => handleSelectInstitute(inst)}
                                                        style={{
                                                            padding: '0.75rem',
                                                            cursor: 'pointer',
                                                            borderBottom: '1px solid var(--border)',
                                                            transition: 'background-color 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
                                                            <p style={{ fontWeight: '500', fontSize: '0.95rem', margin: 0 }}>{inst.name}</p>
                                                            <span style={{
                                                                fontSize: '0.7rem', fontWeight: '600', padding: '0.1rem 0.45rem',
                                                                borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap', flexShrink: 0,
                                                                backgroundColor: 'rgba(99,102,241,0.12)',
                                                                color: 'var(--primary)', border: '1px solid rgba(99,102,241,0.3)'
                                                            }}>
                                                                {inst.nivMod}
                                                            </span>
                                                        </div>
                                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{inst.address}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                    {instituteSearch.length < 3 ? 'Ingresa al menos 3 caracteres' : 'No se encontraron instituciones'}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Section: Personal Info */}
                    <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary)' }}>2. Datos Personales</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label htmlFor="names" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Nombres</label>
                                <input type="text" id="names" name="names" className="input" value={formData.names} onChange={handleChange} required />
                            </div>
                            <div>
                                <label htmlFor="lastNames" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Apellidos</label>
                                <input type="text" id="lastNames" name="lastNames" className="input" value={formData.lastNames} onChange={handleChange} required />
                            </div>
                        </div>

                        <div style={{ marginTop: '1rem' }}>
                            <label htmlFor="dni" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>DNI</label>
                            <input type="text" id="dni" name="dni" className="input" value={formData.dni} onChange={handleChange} required minLength="8" maxLength="8" />
                        </div>
                    </div>

                    {/* Section: Account Data */}
                    <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary)' }}>3. Datos de Cuenta</h3>
                        <div style={{ marginBottom: '1rem' }}>
                            <label htmlFor="username" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Usuario</label>
                            <input type="text" id="username" name="username" className="input" value={formData.username} onChange={handleChange} required />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Contraseña</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showPassword ? "text" : "password"} id="password" name="password" className="input" value={formData.password} onChange={handleChange} required style={{ paddingRight: '40px' }} />
                                <EyeIcon visible={showPassword} onClick={togglePasswordVisibility} />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Confirmar Contraseña</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" name="confirmPassword" className="input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={{ paddingRight: '40px' }} />
                                <EyeIcon visible={showConfirmPassword} onClick={toggleConfirmPasswordVisibility} />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ marginTop: '1rem', background: 'var(--secondary)', boxShadow: 'none' }}
                        disabled={loading}
                    >
                        {loading ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterForm;
