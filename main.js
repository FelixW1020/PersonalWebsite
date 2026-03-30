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
