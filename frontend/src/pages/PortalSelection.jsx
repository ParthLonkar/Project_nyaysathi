import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PortalSelection() {
  const navigate = useNavigate();

  const portals = [
    {
      id: 'admin',
      title: 'Department Admin',
      description: 'Full oversight of case flows, judiciary assignments, and department-wide analytics.',
      icon: 'admin_panel_settings',
      badge: 'High Authority',
      demoUsername: 'admin_nyay01',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWLY9D0ZK-UYdyuAjNU9gC3JJZsGG7PLfDiknn4mHbKjCJbEzQKNJaH7wcCsZcJTzaHeNCMeyYBgmijNOcDXO2033TFaypMuCZzNYYqbpMNAHUE6-TfUSEVItWEJiXp4dYmMOq3slOG4tIrHBSDoD_grX4H0vhkrxGJGg9KOAFJ6tfoaVNL7CahcurkoMBfvXOf6fMYT3PjxhxPD8xL3Y4nLpnmE98-6PxZxZnf54ymcPHnZpcEdZdOZ0HkuW0x7dpJ5gRNOyn5Q4B',
      cta: 'Enter Admin Dashboard',
      accentColor: 'primary',
      buttonClass: 'text-primary',
      borderColor: 'border-primary',
      badgeBgColor: '#dde1ff',
      badgeTextColor: '#00288e',
      path: '/admin/login'
    },
    {
      id: 'officer',
      title: 'Field Officer',
      description: 'Manage ground reports, verify evidence, and update case statuses in real-time.',
      icon: 'verified_user',
      badge: 'Field Operations',
      demoUsername: 'field_agent77',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjt-2IRqCV8qAoQBuQ3qMAMg6bLtHPTLg-UApixB_nyhaaLmGq0Fgz9J5S4Kg3xHRzsFGbzmD1BIhy_p9VM9roAvkq5zYiGc9uEiYzVKonqUnnSicoeuTNgf53rNmOosU_PZeT2zEFmgIqO3az_OHSli1taYyH94-Ln4EchRSt4kX0LKmzzDHD_MqhFLLb6HqbcdZ5NVGF98IzAvaaJRBz335M08jb9kqF9ACB2CxtDtPtqQLVoo4x2rbDUZzop8zH0WtdJOZdKZ0q',
      cta: 'Enter Officer Portal',
      accentColor: 'secondary',
      buttonClass: 'text-secondary',
      borderColor: 'border-secondary',
      badgeBgColor: '#89f5e7',
      badgeTextColor: '#006a61',
      path: '/staff/login'
    }
  ];

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="w-full border-b border-outline-variant/15 bg-surface-bright shadow-[0_2px_8px_rgba(25,28,29,0.04)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo and Brand */}
          <div
            className="flex items-center space-x-2 cursor-pointer hover:opacity-75 transition-opacity"
            onClick={() => navigate('/')}
          >
            <span
              className="material-symbols-outlined text-primary text-3xl"
              style={{ fontVariationSettings: "'FILL' 0" }}>
              account_balance
            </span>
            <h1 className="font-headline font-black text-xl tracking-tighter text-primary hidden sm:block">
              NyaySathi
            </h1>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => navigate('/')}
              className="font-body font-medium text-on-surface hover:text-primary transition-colors text-sm bg-none border-none cursor-pointer p-0"
            >
              Home
            </button>
            <button
              onClick={() => {
                const id = prompt('Enter your Complaint Reference ID:');
                if (id) navigate(`/track/${encodeURIComponent(id.trim())}`);
              }}
              className="font-body font-medium text-on-surface hover:text-primary transition-colors text-sm bg-none border-none cursor-pointer p-0"
            >
              Track Complaint
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/login')}
              className="hidden lg:block px-4 py-2 text-sm font-semibold text-primary border-2 border-primary rounded-lg hover:bg-primary hover:text-on-primary transition-all duration-200"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/submit')}
              className="px-4 py-2 text-sm font-bold text-on-primary bg-primary rounded-lg hover:shadow-lg hover:shadow-primary/40 transition-all duration-200"
            >
              File Complaint
            </button>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <header className="w-full py-6 px-6 flex flex-col items-center text-center">
        <div className="mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-fixed rounded-full mb-3">
            <span
              className="material-symbols-outlined text-xs text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}>
              shield
            </span>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">
              Secure Access Portal
            </span>
          </div>
        </div>
        <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface mb-2 tracking-tight">
          Choose Your Portal
        </h2>
        <p className="font-body text-on-surface-variant max-w-xl mx-auto text-sm leading-relaxed">
          Secure access gateway for specialized legal and field operations.
        </p>
      </header>

      {/* Main Content Area: Portal Cards */}
      <main className="flex-grow container mx-auto px-4 pb-6 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {portals.map((portal) => (
            <div key={portal.id} className="group relative flex flex-col">
              {/* Card with Image */}
              <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_32px_64px_-12px_rgba(25,28,29,0.04)] transition-all duration-300 hover:-translate-y-2 cursor-pointer border border-transparent hover:border-outline-variant/20">
                {/* Image Container */}
                <div className="h-40 overflow-hidden">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    alt={portal.title}
                    src={portal.image}
                  />
                  {/* Gradient Overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: portal.id === 'admin'
                        ? 'linear-gradient(to top, rgba(0, 40, 142, 0.8), rgba(0, 40, 142, 0.2), transparent)'
                        : 'linear-gradient(to top, rgba(0, 106, 97, 0.8), rgba(0, 106, 97, 0.2), transparent)'
                    }}>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="rounded-full p-3"
                      style={{ backgroundColor: portal.badgeBgColor }}>
                      <span
                        className="material-symbols-outlined text-3xl"
                        style={{
                          fontVariationSettings: portal.id === 'officer' ? "'FILL' 1" : "'FILL' 0",
                          color: portal.badgeTextColor
                        }}>
                        {portal.icon}
                      </span>
                    </div>
                    <span
                      className="text-xs font-headline font-bold uppercase tracking-widest"
                      style={{
                        color: portal.id === 'admin' ? '#00288e' : '#006a61',
                        opacity: 0.6
                      }}>
                      {portal.badge}
                    </span>
                  </div>

                  <h3 className="font-headline font-bold text-lg text-on-surface mb-1">
                    {portal.title}
                  </h3>
                  <p className="font-body text-on-surface-variant mb-4 text-xs">
                    {portal.description}
                  </p>

                  {/* CTA */}
                  <div
                    className={`flex items-center font-semibold cursor-pointer group-hover:underline decoration-2 underline-offset-4 transition-colors ${portal.buttonClass}`}>
                    {portal.cta}
                    <span
                      className="material-symbols-outlined ml-2 text-sm"
                      style={{ fontVariationSettings: "'FILL' 0" }}>
                      arrow_forward
                    </span>
                  </div>
                </div>
              </div>

              {/* Demo Credentials */}
              <div
                className="mt-3 p-3 rounded-lg bg-surface-container-low flex flex-col space-y-1"
                style={{
                  borderLeft: `4px solid ${portal.accentColor === 'primary' ? '#00288e' : '#006a61'}`
                }}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant/70">
                    Demo Credentials
                  </span>
                  <span
                    className="material-symbols-outlined text-xs text-on-surface-variant"
                    style={{ fontVariationSettings: "'FILL' 0" }}>
                    {portal.id === 'admin' ? 'lock' : 'lock_open'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase font-medium">
                      User ID
                    </p>
                    <p className="font-body text-sm font-semibold">
                      {portal.demoUsername}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase font-medium">
                      Passkey
                    </p>
                    <p className="font-body text-sm font-semibold">
                      ••••••••
                    </p>
                  </div>
                </div>
              </div>

              {/* Clickable wrapper */}
              <div
                onClick={() => navigate(portal.path)}
                className="absolute inset-0 cursor-pointer rounded-xl"
                style={{ zIndex: 0 }}>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer Support Section */}
      <footer className="w-full py-4 border-t border-outline-variant/15 text-center">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 md:space-x-6 text-sm text-on-surface-variant font-medium">
          <a className="hover:text-primary transition-colors" href="#">
            Privacy Protocol
          </a>
          <span className="hidden md:block h-4 w-px bg-outline-variant/30"></span>
          <a className="hover:text-primary transition-colors" href="#">
            Digital Forensics Support
          </a>
          <span className="hidden md:block h-4 w-px bg-outline-variant/30"></span>
          <a className="hover:text-primary transition-colors" href="#">
            Technical Manual
          </a>
        </div>
        <p className="mt-4 text-[10px] uppercase tracking-widest text-on-surface-variant/40">
          © 2024 NyaySathi Justice Management Systems • Secured with 256-bit Encryption
        </p>
      </footer>
    </div>
  );
}

