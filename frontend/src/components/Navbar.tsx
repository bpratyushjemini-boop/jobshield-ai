'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Menu, X, Sun, Moon } from 'lucide-react';
import { checkHealth } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/theme';
import { LiquidGlassSurface } from '@/components/ui/liquid-glass';

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme, isMounted } = useTheme();
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    checkHealth()
      .then((res) => {
        if (!mounted) return;
        setBackendStatus(res.model_loaded ? 'online' : 'offline');
      })
      .catch(() => {
        if (!mounted) return;
        setBackendStatus('offline');
      });

    const interval = setInterval(() => {
      checkHealth().then((res) => {
        if (!mounted) return;
        setBackendStatus(res.model_loaded ? 'online' : 'offline');
      });
    }, 20000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const navLinks = [
    { href: '/', label: 'Overview' },
    { href: '/analyze', label: 'Detector' },
    { href: '/model', label: 'Model & Metrics' },
    { href: '/history', label: 'Audit History' },
  ];

  const themeLabel =
    theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <header className="sticky top-0 z-50 w-full transition-colors duration-200">
      {/* Primary Application: Liquid Glass Navigation Surface */}
      <LiquidGlassSurface
        variant="nav"
        radius={0}
        optics={{
          frost: 3,
          strength: 0.05,
          dispersion: 0.00,
          curvature: 0.02,
          sheen: 0.18,
          specular: 0.22,
        }}
        className="w-full border-x-0 border-t-0 border-b border-[var(--card-border)] shadow-xs"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 w-full flex items-center justify-between">
          {/* Brand identity: Royal Blue in light, Swan Wing in dark */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-md bg-[#112250] text-[#F5F0E9] dark:bg-[#F5F0E9] dark:text-[#112250] flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
              <Shield className="w-3.5 h-3.5 fill-current stroke-current" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold tracking-tight text-sm text-[var(--foreground)]">
                JOBSHIELD
              </span>
              <span className="text-[9px] font-mono font-medium tracking-wider uppercase px-1.5 py-0.2 rounded bg-[var(--subtle-bg)] text-[var(--muted-text)] border border-[var(--card-border)]">
                AI
              </span>
            </div>
          </Link>

          {/* Desktop navigation links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'text-[var(--foreground)] bg-[#112250]/10 dark:bg-[#F5F0E9]/10 font-semibold nav-link-active'
                      : 'text-[var(--muted-text)] hover:text-[var(--foreground)] hover:bg-[#112250]/5 dark:hover:bg-[#F5F0E9]/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side: Backend Status, Theme Toggle, Primary CTA */}
          <div className="flex items-center gap-2.5">
            {/* Backend Status Pill: Clean, non-nested */}
            <div
              className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 text-xs rounded-md bg-[var(--subtle-bg)]/80 border border-[var(--card-border)] shadow-xs"
              title={
                backendStatus === 'online'
                  ? 'TF-IDF Classifier & Inference Engine are ready'
                  : backendStatus === 'checking'
                  ? 'Connecting to ML engine...'
                  : 'Backend API is currently offline'
              }
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  backendStatus === 'online'
                    ? 'bg-[#3C507D] dark:bg-[#E0C58F]'
                    : backendStatus === 'checking'
                    ? 'bg-[#E0C58F]'
                    : 'bg-[#991B1B]'
                }`}
              />
              <span className="text-[11px] font-medium text-[var(--foreground)]">
                {backendStatus === 'online'
                  ? 'Model active'
                  : backendStatus === 'checking'
                  ? 'Connecting'
                  : 'Offline'}
              </span>
            </div>

            {/* Theme Toggle Button */}
            <button
              type="button"
              id="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={themeLabel}
              title={themeLabel}
              className="p-2 rounded-lg text-[var(--foreground)] bg-[var(--subtle-bg)]/70 hover:bg-[var(--subtle-bg)] border border-[var(--card-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)]/30 transition-all cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              {isMounted ? (
                theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-[var(--foreground)]" />
                ) : (
                  <Sun className="w-4 h-4 text-[var(--foreground)]" />
                )
              ) : (
                <span className="w-4 h-4 inline-block" />
              )}
            </button>

            <Link href="/analyze" className="hidden sm:inline-flex">
              <Button size="sm" className="font-semibold text-xs shadow-xs">
                <span>Analyze a job</span>
              </Button>
            </Link>

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-[var(--muted-text)] hover:text-[var(--foreground)] hover:bg-[var(--subtle-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)]/30 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile navigation drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--card-border)] px-4 pt-2 pb-4 space-y-2 bg-[var(--card-bg)]">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-md text-sm transition-colors min-h-[44px] flex items-center ${
                    isActive
                      ? 'text-[var(--foreground)] bg-[var(--subtle-bg)] font-semibold'
                      : 'text-[var(--muted-text)] hover:text-[var(--foreground)] hover:bg-[var(--subtle-bg)]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-[var(--card-border)]">
              <Link
                href="/analyze"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full block"
              >
                <Button size="sm" className="w-full font-semibold text-xs min-h-[44px]">
                  <span>Analyze a job</span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </LiquidGlassSurface>
    </header>
  );
}
