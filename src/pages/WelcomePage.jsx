import { useState } from 'react';

const WelcomePage = () => {
    return (
        <div className="container animate-fade-in" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
            <header style={{ marginBottom: '4rem' }}>
                <h1 style={{
                    fontSize: '3.5rem',
                    fontWeight: '800',
                    background: 'linear-gradient(to right, var(--primary), var(--secondary))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '1.5rem'
                }}>
                    Bienvenido a Dremo
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                    La plataforma educativa del futuro. Gestiona tu aprendizaje de manera eficiente y escalable.
                </p>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                marginTop: '4rem'
            }}>
                <div className="card">
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>Rápido</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Optimizado para un rendimiento excepcional y tiempos de carga mínimos.</p>
                </div>
                <div className="card">
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--secondary)' }}>Seguro</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Protección de datos de nivel empresarial y autenticación robusta.</p>
                </div>
                <div className="card">
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--success)' }}>Intuitivo</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Diseñado pensando en la experiencia de usuario y la facilidad de uso.</p>
                </div>
            </div>

        </div>
    );
};

export default WelcomePage;
