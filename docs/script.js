// ===== THEME TOGGLE ===== 

// Check for saved theme preference or default to 'light'
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

// Theme toggle button
const themeToggle = document.getElementById('themeToggle');

if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    // Update DOM
    document.documentElement.setAttribute('data-theme', newTheme);

    // Save preference
    localStorage.setItem('theme', newTheme);

    // Update icon
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-icon');
    if (icon) {
        icon.textContent = theme === 'light' ? '🌙' : '☀️';
    }
}

// ===== SMOOTH SCROLL NAV LINKS ===== 

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        const target = document.querySelector(href);
        
        // Only prevent default if it's an internal link and target exists
        if (href !== '#' && target) {
            e.preventDefault();
            // Use smooth scroll
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Also update URL hash
            window.history.pushState(null, null, href);
        }
    });
});

// ===== NAVBAR ACTIVE LINK ===== 

function updateActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        // Don't mark as active for homepage
        if (href === 'index.html' || href === 'docs.html') {
            if ((window.location.pathname.includes(href) || 
                 (href === 'index.html' && window.location.pathname === '/')) ||
                 (href === 'docs.html' && window.location.pathname.includes('docs'))) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        }
    });

    sidebarLinks.forEach(link => {
        const href = link.getAttribute('href');
        const element = document.querySelector(href);
        if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= 150 && rect.bottom >= 150) {
                sidebarLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        }
    });
}

window.addEventListener('scroll', updateActiveNavLink);
updateActiveNavLink();

// ===== MOBILE MENU TOGGLE (Future Enhancement) ===== 

function addMobileMenuToggle() {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;

    // This could be enhanced for mobile responsiveness
    // by adding a hamburger menu
}

// ===== ANIMATION ON SCROLL ===== 

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements
document.querySelectorAll('.feature-card, .blog-post, .tech-item, .doc-section').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});

// Add keyframe animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// ===== SIDEBAR AUTO-SCROLL (Docs Page) ===== 

function initSidebarScroll() {
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (!sidebarNav) return;

    const sidebar = document.querySelector('.docs-sidebar');
    window.addEventListener('scroll', () => {
        const sidebarTop = sidebar.offsetTop;
        const scrollTop = window.scrollY;

        // Keep sidebar visible on scroll
        if (scrollTop > sidebarTop - 100) {
            sidebar.style.top = (scrollTop - sidebarTop + 100) + 'px';
        } else {
            sidebar.style.top = '90px';
        }
    });
}

initSidebarScroll();

// ===== COPY CODE BLOCKS ===== 

function addCopyButtonToCodeBlocks() {
    const codeBlocks = document.querySelectorAll('.code-block');

    codeBlocks.forEach((block, index) => {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = 'Copiar';
        copyBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            padding: 6px 12px;
            background-color: var(--primary);
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.85em;
            opacity: 0;
            transition: opacity 0.2s;
        `;

        block.style.position = 'relative';
        block.addEventListener('mouseenter', () => copyBtn.style.opacity = '1');
        block.addEventListener('mouseleave', () => copyBtn.style.opacity = '0');

        copyBtn.addEventListener('click', () => {
            const code = block.querySelector('code').textContent;
            navigator.clipboard.writeText(code).then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = '✓ Copiado!';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            });
        });

        block.appendChild(copyBtn);
    });
}

addCopyButtonToCodeBlocks();

// ===== SMOOTH PAGE TRANSITIONS ===== 

window.addEventListener('pageshow', (event) => {
    document.body.style.opacity = '1';
});

window.addEventListener('pagehide', (event) => {
    document.body.style.opacity = '0';
});

// ===== CONSOLE MESSAGE ===== 

console.log('%cOrbital Note', 'color: #6366f1; font-size: 24px; font-weight: bold;');
console.log('%cDocumentation & Blog', 'color: #666; font-size: 14px;');
console.log('%cBuild with ❤️ for the community', 'color: #999; font-size: 12px;');
