import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import adminService from '../services/adminService';
import instituteService from '../services/instituteService';
import { useNotification } from '../context/NotificationContext';

const NIV_MOD_OPTIONS = [
    { value: '', label: 'Todos los niveles' },
    { value: 'Inicial', label: 'Inicial' },
    { value: 'Primaria', label: 'Primaria' },
    { value: 'Secundaria', label: 'Secundaria' },
];

const AdminDashboard = () => {
    const { user } = useAuth();
    const { showNotification } = useNotification();

    // Institute Search State
    const [searchName, setSearchName] = useState('');
    const [searchNivMod, setSearchNivMod] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedInstitute, setSelectedInstitute] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [dropdownRect, setDropdownRect] = useState(null);

    const searchTimeoutRef = useRef(null);
    const inputRef = useRef(null);

    // Invitation State
    const [generating, setGenerating] = useState(false);
    const [inviteLink, setInviteLink] = useState('');

    // Position the portal dropdown below the input (fixed = viewport coords, no scrollY needed)
    const updateDropdownRect = useCallback(() => {
        if (inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            setDropdownRect({
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width,
            });
        }
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (inputRef.current && !inputRef.current.closest('[data-search-container]')?.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('resize', updateDropdownRect);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('resize', updateDropdownRect);
        };
    }, [updateDropdownRect]);

    // Debounced search
    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        if (selectedInstitute && searchName === selectedInstitute.name) return;

        searchTimeoutRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const results = await instituteService.searchInstitutes(searchName, searchNivMod);
                setSearchResults(results || []);
                updateDropdownRect();
                setShowDropdown(true);
            } catch {
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 350);

        return () => clearTimeout(searchTimeoutRef.current);
    }, [searchName, searchNivMod]);

    const handleSelectInstitute = (institute) => {
        setSelectedInstitute(institute);
        setSearchName(institute.name);
        setShowDropdown(false);
        setInviteLink('');
    };

    const handleSearchNameChange = (e) => {
        setSearchName(e.target.value);
        setSelectedInstitute(null);
        setInviteLink('');
    };

    const handleNivModChange = (e) => {
        setSearchNivMod(e.target.value);
        setSelectedInstitute(null);
        setInviteLink('');
    };

    const handleGenerateInvite = async () => {
        if (!selectedInstitute) return;
        setGenerating(true);
        setInviteLink('');
        try {
            const data = await adminService.createTeacherInvitation(selectedInstitute.id);
            const urlStr = typeof data === 'string' && data.startsWith('http')
                ? data
                : `${window.location.origin}/teacher/signup/${data}`;
            setInviteLink(urlStr);
            showNotification('Enlace de invitación generado correctamente', 'success');
        } catch (err) {
            console.error('Failed to generate invite', err);
            showNotification('Error al generar la invitación', 'error');
        } finally {
            setGenerating(false);
        }
    };

    const copyToClipboard = () => {
        if (!inviteLink) return;
        navigator.clipboard.writeText(inviteLink);
        showNotification('Copiado al portapapeles', 'info');
    };

    // Dropdown rendered via portal so it floats above all cards
    const DropdownPortal = () => {
        if (!showDropdown || !dropdownRect) return null;
        return createPortal(
            <div style={{
                position: 'fixed',
                top: dropdownRect.top,
                left: dropdownRect.left,
                width: dropdownRect.width,
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
                zIndex: 99999,
                maxHeight: '220px',
                overflowY: 'auto',
            }}>
                {searching ? (
                    <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Buscando...
                    </div>
                ) : searchResults.length === 0 ? (
                    <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Sin resultados{searchName ? ` para "${searchName}"` : ''}
                    </div>
                ) : searchResults.map(inst => (
                    <div
                        key={inst.id}
                        onMouseDown={(e) => { e.preventDefault(); handleSelectInstitute(inst); }}
                        style={{
                            padding: '0.75rem 1rem',
                            cursor: 'pointer',
                            borderBottom: '1px solid var(--border)',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <div style={{ fontWeight: '500', fontSize: '0.9rem', color: 'var(--text)' }}>{inst.name}</div>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.2rem' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inst.nivMod}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inst.address}</span>
                        </div>
                    </div>
                ))}
            </div>,
            document.body
        );
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <DashboardNavbar />
            <div className="container" style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ marginBottom: '0.2rem', color: 'var(--text)' }}>Panel de Administración</h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                        Modo Administrador — {user?.username}
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>

                    {/* Teacher Invitation Card */}
                    <div className="card animate-fade-in" style={{ border: '1px solid var(--primary)' }}>
                        <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                👨‍🏫 Invitar Docente
                            </h2>
                            <p style={{ margin: '0.4rem 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                Busca una institución y genera un enlace de registro único para un nuevo profesor.
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                            {/* Filter: NivMod */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: '500' }}>
                                    Nivel / Modalidad
                                </label>
                                <select
                                    className="input"
                                    value={searchNivMod}
                                    onChange={handleNivModChange}
                                    style={{ width: '100%', boxSizing: 'border-box' }}
                                >
                                    {NIV_MOD_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                                            
                            {/* Searchable Institute Input — portal-based dropdown */}
                            <div data-search-container="true">
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: '500' }}>
                                    Buscar Institución
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        className="input"
                                        value={searchName}
                                        onChange={handleSearchNameChange}
                                        onFocus={() => { updateDropdownRect(); if (searchResults.length > 0) setShowDropdown(true); }}
                                        placeholder="Escriba el nombre de la institución..."
                                        style={{ width: '100%', boxSizing: 'border-box', paddingRight: '2.5rem' }}
                                    />
                                    {searching && (
                                        <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                            ···
                                        </span>
                                    )}
                                    {selectedInstitute && !searching && (
                                        <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--success)', fontSize: '1.1rem' }}>
                                            ✓
                                        </span>
                                    )}
                                </div>
                                <DropdownPortal />
                            </div>

                            {/* Selected Institute Badge */}
                            {selectedInstitute && (
                                <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(99,102,241,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99,102,241,0.3)' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Institución seleccionada
                                    </div>
                                    <div style={{ fontWeight: '500', color: 'var(--text)', fontSize: '0.9rem' }}>{selectedInstitute.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                                        ID: {selectedInstitute.id} · {selectedInstitute.nivMod} · {selectedInstitute.address}
                                    </div>
                                </div>
                            )}

                            <button
                                className="btn btn-primary"
                                onClick={handleGenerateInvite}
                                disabled={generating || !selectedInstitute}
                                style={{ marginTop: '0.25rem' }}
                            >
                                {generating ? 'Generando enlace...' : 'Generar Enlace Seguro 🔗'}
                            </button>
                        </div>

                        {/* Result Area */}
                        {inviteLink && (
                            <div style={{ marginTop: '1.5rem', padding: '1.25rem', backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: '600', color: 'var(--success)' }}>
                                    ✅ Enlace generado
                                </p>
                                <div style={{
                                    padding: '0.75rem',
                                    backgroundColor: 'var(--background)',
                                    borderRadius: 'var(--radius-sm)',
                                    fontFamily: 'monospace',
                                    fontSize: '0.8rem',
                                    color: 'var(--text)',
                                    wordBreak: 'break-all',
                                    border: '1px solid var(--border)',
                                    marginBottom: '0.75rem'
                                }}>
                                    {inviteLink}
                                </div>
                                <button
                                    className="btn btn-outline"
                                    onClick={copyToClipboard}
                                    style={{ width: '100%', fontSize: '0.9rem', padding: '0.4rem' }}
                                >
                                    Copiar Enlace
                                </button>
                                <p style={{ margin: '0.75rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                    Envía este enlace al docente para que cree su cuenta en <strong>{selectedInstitute?.name}</strong>.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Placeholder card */}
                    <div className="card animate-fade-in" style={{ animationDelay: '0.1s', opacity: 0.7 }}>
                        <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0', color: 'var(--text)' }}>
                            🏫 Gestión de Instituciones
                        </h2>
                        <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Crea y administra los colegios de la red (Próximamente).
                        </p>
                        <button className="btn btn-outline" disabled style={{ width: '100%' }}>En desarrollo</button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
