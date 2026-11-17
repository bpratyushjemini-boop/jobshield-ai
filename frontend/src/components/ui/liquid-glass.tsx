'use client';

import React, { Component, ErrorInfo } from 'react';
import { Glass, type GlassOptics } from '@aberhamm/liquid-glass-react';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';

export interface LiquidGlassSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  radius?: number;
  optics?: Partial<GlassOptics>;
  /** Subtle tint variant */
  variant?: 'nav' | 'control' | 'pill' | 'card' | 'subtle';
  /** Optional interactive hover state */
  interactive?: boolean;
}

interface GlassErrorBoundaryProps {
  fallbackStyle: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
}

interface GlassErrorBoundaryState {
  hasError: boolean;
}

class GlassErrorBoundary extends Component<GlassErrorBoundaryProps, GlassErrorBoundaryState> {
  constructor(props: GlassErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): GlassErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('LiquidGlass WebGL fallback activated:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={this.props.fallbackStyle} className={this.props.className}>
          {this.props.children}
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Selective Liquid Glass material surface.
 * Adapts between Light (Swan Wing / Shell Stone) and Dark (Royal Blue / Sapphire) themes.
 * Uses translucent versions of the palette colors, keeps blur restrained, and preserves crisp legibility.
 * Gracefully falls back to pure CSS if WebGL is unavailable or fails.
 */
export const LiquidGlassSurface: React.FC<LiquidGlassSurfaceProps> = ({
  children,
  className,
  style,
  radius,
  optics,
  variant = 'subtle',
  interactive = false,
  ...props
}) => {
  const { theme, isMounted } = useTheme();
  const isDark = isMounted && theme === 'dark';

  // Conservative optical parameters tailored for cybersecurity UI restraint
  const defaultOptics: Partial<GlassOptics> = {
    frost: variant === 'nav' ? 3 : 2,
    strength: variant === 'control' ? 0.08 : 0.05,
    dispersion: 0.00, // Zero dispersion to eliminate rainbow or multicolor refraction
    curvature: 0.02,  // Flat surface so typography stays crisp
    sheen: 0.18,      // Subtle directional edge highlight
    specular: 0.22,
    saturate: 1.02,
    ...optics,
  };

  // Surface colors: translucent Swan Wing in light mode, translucent Royal Blue/Navy in dark mode
  const getBackgroundColor = () => {
    if (isDark) {
      switch (variant) {
        case 'nav':
          return 'rgba(17, 34, 80, 0.90)'; // Translucent Royal Blue #112250
        case 'control':
          return 'rgba(11, 23, 54, 0.85)'; // Deeper Navy #0B1736
        case 'pill':
          return 'rgba(14, 29, 69, 0.82)'; // Subtle Navy
        case 'card':
          return 'rgba(11, 23, 54, 0.90)';
        default:
          return 'rgba(17, 34, 80, 0.85)';
      }
    } else {
      switch (variant) {
        case 'nav':
          return 'rgba(245, 240, 233, 0.90)'; // Translucent Swan Wing #F5F0E9
        case 'control':
          return 'rgba(255, 255, 255, 0.92)'; // Pure white glass
        case 'pill':
          return 'rgba(245, 240, 233, 0.88)'; // Translucent Swan Wing
        case 'card':
          return 'rgba(255, 255, 255, 0.92)';
        default:
          return 'rgba(245, 240, 233, 0.85)';
      }
    }
  };

  const getBorderColor = () => {
    if (isDark) {
      return 'rgba(60, 80, 125, 0.50)'; // Translucent Sapphire #3C507D
    }
    return 'rgba(217, 203, 194, 0.85)'; // Translucent Shell Stone #D9CBC2
  };

  const computedStyle: React.CSSProperties = {
    display: variant === 'card' ? undefined : 'flex',
    alignItems: variant === 'card' ? undefined : 'center',
    background: getBackgroundColor(),
    borderColor: getBorderColor(),
    borderRadius: radius !== undefined ? radius : undefined,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
    ...style,
  };

  return (
    <GlassErrorBoundary fallbackStyle={computedStyle} className={className}>
      <Glass
        style={computedStyle}
        optics={defaultOptics}
        className={cn(
          'relative border transition-all',
          interactive && 'hover:border-[#3C507D]/60 dark:hover:border-[#E0C58F]/60',
          className
        )}
        {...props}
      >
        {children}
      </Glass>
    </GlassErrorBoundary>
  );
};
