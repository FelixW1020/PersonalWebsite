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
});
