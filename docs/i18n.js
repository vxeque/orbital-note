// ===== INTERNATIONALIZATION (i18n) SYSTEM =====

const translations = {
    es: {
        // Navigation
        'nav.blog': 'Blog',
        'nav.documentation': 'Documentación',
        'nav.features': 'Features',
        'nav.contact': 'Contacto',
        'nav.language': 'EN',

        // Hero Section
        'hero.title': 'Orbital Note',
        'hero.subtitle': 'Una forma moderna de capturar tus ideas, sincronizadas en todos tus dispositivos',
        'hero.btn-docs': 'Leer Documentación',
        'hero.btn-github': 'Ver en GitHub',

        // Features Section
        'features.title': 'Características Principales',
        'features.security-title': 'Autenticación Segura',
        'features.security-desc': 'Login con Google OAuth 2.0, tokens seguros y sincronización segura',
        'features.cloud-title': 'Sincronización en la Nube',
        'features.cloud-desc': 'Google Drive sync automático, accede a tus notas desde cualquier dispositivo',
        'features.editor-title': 'Editor de Texto Enriquecido',
        'features.editor-desc': 'TipTap en web, TenTap en móvil, con formato y colorido',
        'features.multiplatform-title': 'Multiplataforma',
        'features.multiplatform-desc': 'Android y Web nativos, misma experiencia en todos lados',
        'features.tags-title': 'Etiquetas y Colores',
        'features.tags-desc': 'Organiza tus notas con etiquetas personalizables y códigos de color',
        'features.references-title': 'Referencias entre Notas',
        'features.references-desc': 'Crea conexiones entre notas con menciones y referencias cruzadas',

        // Blog Section
        'blog.title': 'Blog & Noticias',
        'blog.post1-title': 'Introducción a Orbital Note v1.0.0',
        'blog.post1-date': '5 de Marzo, 2026',
        'blog.post1-author': 'Equipo Orbital',
        'blog.post1-content': '¡Nos complace anunciar el lanzamiento oficial de Orbital Note v1.0.0! después de meses de desarrollo, hemos creado la aplicación perfecta para capturar y sincronizar tus ideas.',
        'blog.post1-features': 'Esta primer versión incluye todas las características fundamentales:',
        'blog.post2-title': 'Arquitectura Modular: Cómo Escalamos Orbital Note',
        'blog.post2-date': '3 de Marzo, 2026',
        'blog.post2-author': 'Arquitectura',
        'blog.post2-category': 'Técnico',
        'blog.post2-content': 'Uno de nuestros mayores logros en el desarrollo de Orbital Note fue crear una arquitectura escalable y mantenible. Utilizamos un enfoque modular basado en características que separa claramente las responsabilidades.',
        'blog.post2-architecture': 'Nuestra arquitectura consta de varias capas:',
        'blog.post3-title': 'Sincronización Google Drive: Cómo Funciona',
        'blog.post3-date': '1 de Marzo, 2026',
        'blog.post3-author': 'Backend',
        'blog.post3-category': 'Tutorial',
        'blog.post3-content': 'La sincronización con Google Drive es el corazón de Orbital Note. Permite a los usuarios acceder a sus notas desde cualquier dispositivo, en cualquier momento.',
        'blog.post3-system': 'El sistema funciona así:',
        'blog.read-more': 'Leer más →',
        'blog.view-docs': 'Ver Documentación →',

        // Tech Stack
        'tech.title': 'Tech Stack',
        'tech.frontend': 'Frontend',
        'tech.editors': 'Editors',
        'tech.backend': 'Backend & Cloud',
        'tech.state': 'Estado & UI',

        // CTA Section
        'cta.title': '¿Listo para Comenzar?',
        'cta.subtitle': 'Explora la documentación completa o instala Orbital Note ahora',
        'cta.btn-docs': 'Ver Documentación',
        'cta.btn-github': 'GitHub',

        // Footer
        'footer.description': 'Una forma moderna de capturar tus ideas',
        'footer.documentation': 'Documentación',
        'footer.full-guide': 'Guía Completa',
        'footer.architecture': 'Arquitectura',
        'footer.setup': 'Setup',
        'footer.contributing': 'Contribuir',
        'footer.community': 'Comunidad',
        'footer.issues': 'Issues',
        'footer.discussions': 'Discussions',
        'footer.copyright': '© 2026 Orbital Note. Hecho con ❤️ para la comunidad open source',

        // DOCS PAGE
        'docs.title': 'Orbital Note',
        'docs.sidebar-title': 'Documentación',
        'docs.overview': 'Descripción General',
        'docs.features': 'Características',
        'docs.architecture-section': 'Arquitectura',
        'docs.architecture-overview': 'Visión General',
        'docs.data-flow': 'Flujo de Datos',
        'docs.components': 'Componentes',
        'docs.setup-section': 'Setup',
        'docs.installation': 'Instalación',
        'docs.environment': 'Variables de Entorno',
        'docs.oauth': 'Google OAuth',
        'docs.development': 'Desarrollo',
        'docs.tech-stack': 'Tech Stack',
        'docs.contributing': 'Contribuir',
        'docs.security': 'Seguridad',
        
        'docs.intro': 'Una aplicación multiplataforma de toma de notas sincronizadas en la nube, con autenticación segura mediante Google OAuth y sincronización automática con Google Drive.',
        'docs.what-is': '¿Qué es Orbital Note?',
        'docs.what-is-desc': 'Orbital Note es una aplicación moderna de notas que te permite:',
        'docs.feature1': 'Capturar ideas rápidamente con un editor de texto enriquecido',
        'docs.feature2': 'Sincronizar automáticamente tus notas en Google Drive',
        'docs.feature3': 'Acceder desde cualquier dispositivo (Android y Web)',
        'docs.feature4': 'Organizar tus notas con etiquetas y referencias cruzadas',
        'docs.feature5': 'Disfrutar de una interfaz moderna con soporte dark/light mode',
        
        'docs.features-title': 'Características Principales',
        'docs.secure-auth': '🔐 Autenticación Segura',
        'docs.secure-auth-desc': 'Google OAuth 2.0 para login seguro, sin almacenar contraseñas. Tokens seguros con expiración automática.',
        'docs.cloud-sync': '☁️ Sincronización en la Nube',
        'docs.cloud-sync-desc': 'Tus notas se sincronizan automáticamente a Google Drive. Accede desde cualquier dispositivo.',
        'docs.rich-editor': '📝 Editor Enriquecido',
        'docs.rich-editor-desc': 'TipTap en web y TenTap en móvil con formatting, listas, bloques, imágenes y más.',
        'docs.multiplatform': '🎯 Multiplataforma',
        'docs.multiplatform-desc': 'Android nativo y Web. Misma experiencia consistente en todos los dispositivos.',
        
        'docs.architecture': 'Arquitectura del Sistema',
        'docs.architecture-desc': 'Orbital Note sigue una arquitectura modular basada en características con claras separación de responsabilidades.',
        'docs.architecture-layers': 'Capas de la Arquitectura',
        'docs.routing-layer': 'Capa de Routing',
        'docs.routing-layer-desc': 'Expo Router - Navegación basada en archivos',
        'docs.presentation-layer': 'Capa de Presentación',
        'docs.presentation-layer-desc': 'Componentes React Native, Hooks personalizados',
        'docs.state-layer': 'Capa de Estado',
        'docs.state-layer-desc': 'React Context (User, Theme) - Gestión de estado global',
        'docs.business-layer': 'Capa de Lógica de Negocio',
        'docs.business-layer-desc': 'Servicios: Auth, Drive Sync, Token Management',
        'docs.data-layer': 'Capa de Datos',
        'docs.data-layer-desc': 'AsyncStorage + Google Drive API - Persistencia',
        
        'docs.directory-structure': 'Estructura de Directorios',
        
        'docs.auth-flow': '1. Flujo de Autenticación',
        'docs.auth-step1': '1. Usuario abre la app',
        'docs.auth-step2': '2. Se verifica token almacenado',
        'docs.auth-step3': '3. Si no existe, se muestra login',
        'docs.auth-step4': '4. Google OAuth redirect',
        'docs.auth-step5': '5. Token guardado securely',
        'docs.auth-step6': '6. Redirige a app principal',
        
        'docs.note-flow': '2. Flujo de Notas',
        'docs.note-step1': 'Usuario crea/edita nota',
        'docs.note-step2': 'Se guarda en AsyncStorage',
        'docs.note-step3': 'Sincronización a Google Drive',
        'docs.note-step4': 'Se resuelven conflictos',
        'docs.note-step5': 'Nota sincronizada ✓',
        
        'docs.runtime': 'Runtime & Framework',
        'docs.frontend': 'Frontend & UI',
        'docs.editors': 'Editors',
        'docs.backend': 'Backend & Cloud',
        
        'docs.requirements': 'Requisitos',
        'docs.setup-steps': 'Pasos de Instalación',
        'docs.env-create': 'Crea un archivo .env.local con:',
        'docs.oauth-config': 'Configuración Google OAuth',
        
        'docs.contribute-title': 'Contribuir al Proyecto',
        'docs.contribute-start': '¿Cómo Empezar?',
        'docs.code-standards': 'Estándares de Código',
        'docs.naming-conventions': 'Convenciones de Nombres',
        
        'docs.security-title': 'Seguridad',
        'docs.security-measures': 'Medidas de Seguridad Implementadas',
        'docs.report-vulnerabilities': 'Reportar Vulnerabilidades',
        'docs.best-practices': 'Buenas Prácticas',
        'docs.vulnerability-notice': 'Si encuentras una vulnerabilidad de seguridad, no abras un issue público. En su lugar:',
        'docs.vulnerability-email': 'Envía un email a vxeque@gmail.com con detalles de la vulnerabilidad.',
        
        'docs.support-title': 'Soporte & Recursos',
        'docs.need-help': '¿Necesitas Ayuda?',
        'docs.report-bugs': '🐛 Reportar Bugs',
        'docs.bugs-link': 'Abre un issue en GitHub',
        'docs.questions': '💬 Preguntas',
        'docs.questions-link': 'Inicia una discusión',
        'docs.suggestions': '✨ Sugerencias',
        'docs.suggestions-link': 'Propón una feature',
        'docs.docs': '📚 Docs',
        'docs.docs-desc': 'Lee esta documentación completa',
        'docs.useful-links': 'Links Útiles',
        
        'docs.footer-copyright': '© 2026 Orbital Note. Licencia MIT',
    },
    en: {
        // Navigation
        'nav.blog': 'Blog',
        'nav.documentation': 'Documentation',
        'nav.features': 'Features',
        'nav.contact': 'Contact',
        'nav.language': 'ES',

        // Hero Section
        'hero.title': 'Orbital Note',
        'hero.subtitle': 'A modern way to capture your ideas, synchronized across all your devices',
        'hero.btn-docs': 'Read Documentation',
        'hero.btn-github': 'View on GitHub',

        // Features Section
        'features.title': 'Main Features',
        'features.security-title': 'Secure Authentication',
        'features.security-desc': 'Login with Google OAuth 2.0, secure tokens and safe synchronization',
        'features.cloud-title': 'Cloud Synchronization',
        'features.cloud-desc': 'Automatic Google Drive sync, access your notes from any device',
        'features.editor-title': 'Rich Text Editor',
        'features.editor-desc': 'TipTap on web, TenTap on mobile, with formatting and colors',
        'features.multiplatform-title': 'Cross-Platform',
        'features.multiplatform-desc': 'Native Android and Web, same experience everywhere',
        'features.tags-title': 'Tags and Colors',
        'features.tags-desc': 'Organize your notes with customizable tags and color codes',
        'features.references-title': 'Cross-Note References',
        'features.references-desc': 'Create connections between notes with mentions and cross-references',

        // Blog Section
        'blog.title': 'Blog & News',
        'blog.post1-title': 'Introduction to Orbital Note v1.0.0',
        'blog.post1-date': 'March 5, 2026',
        'blog.post1-author': 'Orbital Team',
        'blog.post1-content': 'We are pleased to announce the official launch of Orbital Note v1.0.0! After months of development, we have created the perfect application for capturing and synchronizing your ideas.',
        'blog.post1-features': 'This first version includes all core features:',
        'blog.post2-title': 'Modular Architecture: How We Scaled Orbital Note',
        'blog.post2-date': 'March 3, 2026',
        'blog.post2-author': 'Architecture',
        'blog.post2-category': 'Technical',
        'blog.post2-content': 'One of our greatest achievements in developing Orbital Note was creating a scalable and maintainable architecture. We used a modular feature-based approach that clearly separates responsibilities.',
        'blog.post2-architecture': 'Our architecture consists of several layers:',
        'blog.post3-title': 'Google Drive Synchronization: How It Works',
        'blog.post3-date': 'March 1, 2026',
        'blog.post3-author': 'Backend',
        'blog.post3-category': 'Tutorial',
        'blog.post3-content': 'Google Drive synchronization is the heart of Orbital Note. It allows users to access their notes from any device, at any time.',
        'blog.post3-system': 'The system works like this:',
        'blog.read-more': 'Read more →',
        'blog.view-docs': 'View Documentation →',

        // Tech Stack
        'tech.title': 'Tech Stack',
        'tech.frontend': 'Frontend',
        'tech.editors': 'Editors',
        'tech.backend': 'Backend & Cloud',
        'tech.state': 'State & UI',

        // CTA Section
        'cta.title': 'Ready to Get Started?',
        'cta.subtitle': 'Explore the full documentation or install Orbital Note now',
        'cta.btn-docs': 'View Documentation',
        'cta.btn-github': 'GitHub',

        // Footer
        'footer.description': 'A modern way to capture your ideas',
        'footer.documentation': 'Documentation',
        'footer.full-guide': 'Full Guide',
        'footer.architecture': 'Architecture',
        'footer.setup': 'Setup',
        'footer.contributing': 'Contributing',
        'footer.community': 'Community',
        'footer.issues': 'Issues',
        'footer.discussions': 'Discussions',
        'footer.copyright': '© 2026 Orbital Note. Made with ❤️ for the open source community',

        // DOCS PAGE
        'docs.title': 'Orbital Note',
        'docs.sidebar-title': 'Documentation',
        'docs.overview': 'Overview',
        'docs.features': 'Features',
        'docs.architecture-section': 'Architecture',
        'docs.architecture-overview': 'Overview',
        'docs.data-flow': 'Data Flow',
        'docs.components': 'Components',
        'docs.setup-section': 'Setup',
        'docs.installation': 'Installation',
        'docs.environment': 'Environment Variables',
        'docs.oauth': 'Google OAuth',
        'docs.development': 'Development',
        'docs.tech-stack': 'Tech Stack',
        'docs.contributing': 'Contributing',
        'docs.security': 'Security',
        
        'docs.intro': 'A cross-platform note-taking application with cloud-synchronized notes, secure authentication via Google OAuth, and automatic synchronization with Google Drive.',
        'docs.what-is': 'What is Orbital Note?',
        'docs.what-is-desc': 'Orbital Note is a modern note-taking application that allows you to:',
        'docs.feature1': 'Capture ideas quickly with a rich text editor',
        'docs.feature2': 'Automatically synchronize your notes to Google Drive',
        'docs.feature3': 'Access from any device (Android and Web)',
        'docs.feature4': 'Organize your notes with tags and cross-references',
        'docs.feature5': 'Enjoy a modern interface with dark/light mode support',
        
        'docs.features-title': 'Main Features',
        'docs.secure-auth': '🔐 Secure Authentication',
        'docs.secure-auth-desc': 'Google OAuth 2.0 for secure login, no password storage. Secure tokens with automatic expiration.',
        'docs.cloud-sync': '☁️ Cloud Synchronization',
        'docs.cloud-sync-desc': 'Your notes auto-sync to Google Drive. Access from any device.',
        'docs.rich-editor': '📝 Rich Editor',
        'docs.rich-editor-desc': 'TipTap on web and TenTap on mobile with formatting, lists, blocks, images and more.',
        'docs.multiplatform': '🎯 Cross-Platform',
        'docs.multiplatform-desc': 'Native Android and Web. Same consistent experience across all devices.',
        
        'docs.architecture': 'System Architecture',
        'docs.architecture-desc': 'Orbital Note follows a <strong>modular feature-based architecture</strong> with clear separation of concerns.',
        'docs.architecture-layers': 'Architecture Layers',
        'docs.routing-layer': 'Routing Layer',
        'docs.routing-layer-desc': 'Expo Router - File-based navigation',
        'docs.presentation-layer': 'Presentation Layer',
        'docs.presentation-layer-desc': 'React Native components, Custom Hooks',
        'docs.state-layer': 'State Layer',
        'docs.state-layer-desc': 'React Context (User, Theme) - Global state management',
        'docs.business-layer': 'Business Logic Layer',
        'docs.business-layer-desc': 'Services: Auth, Drive Sync, Token Management',
        'docs.data-layer': 'Data Layer',
        'docs.data-layer-desc': 'AsyncStorage + Google Drive API - Persistence',
        
        'docs.directory-structure': 'Directory Structure',
        
        'docs.auth-flow': '1. Authentication Flow',
        'docs.auth-step1': '1. User opens the app',
        'docs.auth-step2': '2. Stored token is verified',
        'docs.auth-step3': '3. If none exists, login is shown',
        'docs.auth-step4': '4. Google OAuth redirect',
        'docs.auth-step5': '5. Token securely stored',
        'docs.auth-step6': '6. Redirect to main app',
        
        'docs.note-flow': '2. Notes Flow',
        'docs.note-step1': 'User creates/edits note',
        'docs.note-step2': 'Saved in AsyncStorage',
        'docs.note-step3': 'Sync to Google Drive',
        'docs.note-step4': 'Conflicts resolved',
        'docs.note-step5': 'Note synchronized ✓',
        
        'docs.runtime': 'Runtime & Framework',
        'docs.frontend': 'Frontend & UI',
        'docs.editors': 'Editors',
        'docs.backend': 'Backend & Cloud',
        
        'docs.requirements': 'Requirements',
        'docs.setup-steps': 'Installation Steps',
        'docs.env-create': 'Create a .env.local file with:',
        'docs.oauth-config': 'Google OAuth Setup',
        
        'docs.contribute-title': 'Contributing to the Project',
        'docs.contribute-start': 'Getting Started',
        'docs.code-standards': 'Code Standards',
        'docs.naming-conventions': 'Naming Conventions',
        
        'docs.security-title': 'Security',
        'docs.security-measures': 'Security Measures Implemented',
        'docs.report-vulnerabilities': 'Report Vulnerabilities',
        'docs.best-practices': 'Best Practices',
        'docs.vulnerability-notice': 'If you find a security vulnerability, do not open a public issue. Instead:',
        'docs.vulnerability-email': 'Send an email to vxeque@gmail.com with vulnerability details.',
        
        'docs.support-title': 'Support & Resources',
        'docs.need-help': 'Need Help?',
        'docs.report-bugs': '🐛 Report Bugs',
        'docs.bugs-link': 'Open an issue on GitHub',
        'docs.questions': '💬 Questions',
        'docs.questions-link': 'Start a discussion',
        'docs.suggestions': '✨ Suggestions',
        'docs.suggestions-link': 'Propose a feature',
        'docs.docs': '📚 Docs',
        'docs.docs-desc': 'Read this complete documentation',
        'docs.useful-links': 'Useful Links',
        
        'docs.footer-copyright': '© 2026 Orbital Note. MIT License',
    }
};

// Current language
let currentLanguage = localStorage.getItem('language') || 'es';

// Set initial language
document.documentElement.setAttribute('lang', currentLanguage);

/**
 * Get translation for a key
 */
function t(key) {
    return translations[currentLanguage]?.[key] || translations['es']?.[key] || key;
}

/**
 * Change language and update all translations
 */
function setLanguage(lang) {
    if (!translations[lang]) return;

    currentLanguage = lang;
    localStorage.setItem('language', lang);
    document.documentElement.setAttribute('lang', lang);

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = t(key);

        if (element.tagName === 'INPUT') {
            element.placeholder = translation;
        } else if (element.tagName === 'BUTTON' && element.classList.contains('language-toggle')) {
            element.textContent = translation;
        } else if (element.hasAttribute('data-i18n-html')) {
            element.innerHTML = translation;
        } else {
            element.textContent = translation;
        }
    });

    // Update language toggle button
    updateLanguageToggle();
}

/**
 * Update language toggle button text
 */
function updateLanguageToggle() {
    const langToggle = document.getElementById('languageToggle');
    if (langToggle) {
        langToggle.textContent = currentLanguage === 'es' ? 'EN' : 'ES';
    }
}

/**
 * Initialize i18n on page load
 */
function initializeI18n() {
    // Set up language toggle
    const langToggle = document.getElementById('languageToggle');
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            const newLang = currentLanguage === 'es' ? 'en' : 'es';
            setLanguage(newLang);
        });
    }

    // Apply current language
    setLanguage(currentLanguage);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeI18n);
} else {
    initializeI18n();
}
