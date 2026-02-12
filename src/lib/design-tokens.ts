/**
 * Design Tokens
 * Centralized design system constants for consistent UI
 */

export const designTokens = {
    // Icon Sizes (in pixels)
    iconSize: {
        xs: 16,
        sm: 20,
        md: 24,
        lg: 32,
        xl: 40,
    },

    // Spacing Scale (8px grid system)
    spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
    },

    // Border Radius
    borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        full: '9999px',
    },

    // Transition Timings
    transition: {
        fast: '150ms',
        normal: '250ms',
        slow: '350ms',
    },

    // Modern Shadow System
    shadows: {
        soft: '0 2px 8px rgba(0, 0, 0, 0.04)',
        medium: '0 4px 16px rgba(0, 0, 0, 0.08)',
        strong: '0 8px 32px rgba(0, 0, 0, 0.12)',
        glow: '0 0 20px rgba(var(--primary-rgb), 0.3)',
    },

    // Animation Curves
    easing: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
} as const;

// Helper function to get icon size class
export const getIconSizeClass = (size: keyof typeof designTokens.iconSize = 'sm') => {
    const sizeMap = {
        xs: 'h-4 w-4',
        sm: 'h-5 w-5',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-10 w-10',
    };
    return sizeMap[size];
};

// Helper function for transition classes
export const getTransitionClass = (speed: keyof typeof designTokens.transition = 'normal') => {
    return `transition-all duration-${speed === 'fast' ? '150' : speed === 'normal' ? '250' : '350'}`;
};
