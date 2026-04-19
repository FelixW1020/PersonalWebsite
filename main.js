document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.tab-section');
    const body = document.body;

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active classes
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Add active class to clicked link
            link.classList.add('active');

            // Show corresponding section
            const targetId = link.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }

            // Update body class to toggle hero video visibility
            body.className = `${targetId}-active`;

            // Scroll behavior
            if (targetId === 'portfolio') {
                const contentArea = document.querySelector('.content');
                if (contentArea) {
                    contentArea.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                window.scrollTo(0, 0); // Always snap back to the top for minimalist text-based tabs
            }
        });
    });

    // Add logic for deeply linking from project cards
    const projectLinks = document.querySelectorAll('.project-link');
    projectLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Reset active states
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Activate the deeply linked project section
            const targetId = link.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) targetSection.classList.add('active');
            
            // Hide the hero video since this is not the root portfolio page
            body.className = `${targetId}-active`;
            
            // If returning to portfolio, scroll to grid. Otherwise snap to top
            if (targetId === 'portfolio') {
                const portfolioNav = document.querySelector('.nav-link[data-target="portfolio"]');
                if (portfolioNav) portfolioNav.classList.add('active');
                
                const contentArea = document.querySelector('.content');
                if (contentArea) contentArea.scrollIntoView({ behavior: 'smooth' });
            } else {
                window.scrollTo(0, 0); // Snap to top natively
            }
        });
    });

    const homeLogo = document.getElementById('home-logo');
    if (homeLogo) {
        homeLogo.addEventListener('click', (e) => {
            e.preventDefault();
            // Reset to Portfolio defaults
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            const portfolioLink = document.querySelector('.nav-link[data-target="portfolio"]');
            if (portfolioLink) portfolioLink.classList.add('active');
            
            const portfolioSection = document.getElementById('portfolio');
            if (portfolioSection) portfolioSection.classList.add('active');
            
            body.className = 'portfolio-active';
            
            // Scroll completely to the top of the hero banner
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});
