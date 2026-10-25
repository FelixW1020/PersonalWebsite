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
            if (targetSection) {
                targetSection.classList.add('active');
                // Autoplay doesn't start on videos that were display:none at load
                targetSection.querySelectorAll('video[autoplay]').forEach(v => v.play().catch(() => {}));
            }

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

    // Force hero video to play (addresses iOS strict autoplay policies)
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
        heroVideo.play().catch(() => {});
        document.body.addEventListener('touchstart', () => {
            if (heroVideo.paused) {
                heroVideo.play().catch(() => {});
            }
        }, { once: true });
    }

    // Chart tooltips on the bioimpedance page: the value leads, the label follows
    const charts = document.querySelectorAll('svg.bz-chart');
    if (charts.length) {
        const tip = document.createElement('div');
        tip.className = 'bz-tip';
        const tipValue = document.createElement('strong');
        const tipLabel = document.createElement('span');
        tip.append(tipValue, tipLabel);
        document.body.appendChild(tip);

        const showTip = (x, y, value, label) => {
            tipValue.textContent = value;
            tipLabel.textContent = label;
            tip.style.left = `${Math.min(x + 14, window.innerWidth - tip.offsetWidth - 8)}px`;
            tip.style.top = `${y + 14}px`;
            tip.classList.add('on');
        };
        const hideTip = () => tip.classList.remove('on');
        const toSvg = (svg, e) => {
            const pt = svg.createSVGPoint();
            pt.x = e.clientX;
            pt.y = e.clientY;
            return pt.matrixTransform(svg.getScreenCTM().inverse());
        };

        charts.forEach(svg => {
            const mode = svg.dataset.hover;

            if (mode === 'nearest') {
                // Scatter: snap to the closest dot within ~24 px of the pointer
                const dots = [...svg.querySelectorAll('circle[data-v]')];
                let hot = null;
                svg.addEventListener('pointermove', e => {
                    const p = toSvg(svg, e);
                    const reach = 24 / svg.getScreenCTM().a;
                    let best = null, bestD = reach * reach;
                    dots.forEach(dot => {
                        const dx = dot.cx.baseVal.value - p.x, dy = dot.cy.baseVal.value - p.y;
                        if (dx * dx + dy * dy < bestD) { best = dot; bestD = dx * dx + dy * dy; }
                    });
                    if (hot && hot !== best) hot.classList.remove('hot');
                    hot = best;
                    if (!best) { hideTip(); return; }
                    best.classList.add('hot');
                    showTip(e.clientX, e.clientY, best.dataset.v, best.dataset.l);
                });
                svg.addEventListener('pointerleave', () => {
                    if (hot) hot.classList.remove('hot');
                    hideTip();
                });
            } else if (mode === 'x') {
                // Line charts: a crosshair snaps to the nearest sample along x
                const lines = svg.querySelectorAll('.bz-cross');
                const marks = svg.querySelectorAll('.bz-dot');
                svg.querySelectorAll('rect.bz-hit').forEach((hit, i) => {
                    const pts = JSON.parse(hit.dataset.pts);
                    const line = lines[i], mark = marks[i];
                    hit.addEventListener('pointermove', e => {
                        const x = toSvg(svg, e).x;
                        let lo = 0, hi = pts.length - 1;
                        while (hi - lo > 1) {
                            const mid = (lo + hi) >> 1;
                            if (pts[mid][0] < x) lo = mid; else hi = mid;
                        }
                        const pt = Math.abs(pts[lo][0] - x) < Math.abs(pts[hi][0] - x) ? pts[lo] : pts[hi];
                        line.setAttribute('x1', pt[0]);
                        line.setAttribute('x2', pt[0]);
                        line.setAttribute('visibility', 'visible');
                        mark.setAttribute('cx', pt[0]);
                        mark.setAttribute('cy', pt[1]);
                        mark.setAttribute('visibility', 'visible');
                        showTip(e.clientX, e.clientY, hit.dataset.v.replace('{v}', pt[2].toFixed(2)),
                            hit.dataset.l.replace('{x}', Math.round(pt[3])));
                    });
                    hit.addEventListener('pointerleave', () => {
                        line.setAttribute('visibility', 'hidden');
                        mark.setAttribute('visibility', 'hidden');
                        hideTip();
                    });
                });
            } else {
                // Bars: each mark is its own hit target, by pointer or keyboard
                svg.querySelectorAll('[data-v]').forEach(mark => {
                    const show = e => {
                        const r = mark.getBoundingClientRect();
                        const x = e.clientX ?? r.left + r.width / 2, y = e.clientY ?? r.top;
                        showTip(x, y, mark.dataset.v, mark.dataset.l);
                    };
                    mark.addEventListener('pointermove', show);
                    mark.addEventListener('focus', show);
                    mark.addEventListener('pointerleave', hideTip);
                    mark.addEventListener('blur', hideTip);
                });
            }
        });
    }
});
