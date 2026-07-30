(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

    /* ---------- Trailing cursor ring ----------
       The native cursor is a small dot (CSS). This ring lerps toward the pointer
       so it lags behind, and swells over interactive targets. */
    if (!reduceMotion && !coarsePointer) {
        const ring = document.querySelector('.cursor-ring');
        if (ring) {
            let pointerX = window.innerWidth / 2;
            let pointerY = window.innerHeight / 2;
            let ringX = pointerX;
            let ringY = pointerY;
            let seen = false;

            window.addEventListener('pointermove', (e) => {
                pointerX = e.clientX;
                pointerY = e.clientY;
                if (!seen) {
                    // Jump to the first known position so it doesn't fly in from center
                    ringX = pointerX;
                    ringY = pointerY;
                    ring.classList.add('is-visible');
                    seen = true;
                }

                // Swell over anything clickable
                const target = e.target;
                const hot = target instanceof Element &&
                    target.closest('a, button, [data-hot]');
                ring.classList.toggle('is-hot', Boolean(hot));
            }, { passive: true });

            document.addEventListener('pointerleave', () => {
                ring.classList.remove('is-visible');
                seen = false;
            });

            const followPointer = () => {
                ringX += (pointerX - ringX) * 0.18;
                ringY += (pointerY - ringY) * 0.18;
                ring.style.transform =
                    `translate(${ringX.toFixed(2)}px, ${ringY.toFixed(2)}px) translate(-50%, -50%)`;
                requestAnimationFrame(followPointer);
            };
            requestAnimationFrame(followPointer);
        }
    }

    /* ---------- Mouse parallax on the sky ----------
       Sits on the outer wrapper so it composes with the CSS drift on .sky
       rather than fighting it for the transform property. */
    if (!reduceMotion && !coarsePointer) {
        const parallax = document.querySelector('.sky-parallax');
        if (parallax) {
            const MAX_SHIFT = 14; // px
            let targetX = 0;
            let targetY = 0;
            let currentX = 0;
            let currentY = 0;

            window.addEventListener('pointermove', (e) => {
                targetX = ((e.clientX / window.innerWidth) - 0.5) * -2 * MAX_SHIFT;
                targetY = ((e.clientY / window.innerHeight) - 0.5) * -2 * MAX_SHIFT;
            }, { passive: true });

            const followParallax = () => {
                currentX += (targetX - currentX) * 0.05;
                currentY += (targetY - currentY) * 0.05;
                parallax.style.transform =
                    `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
                requestAnimationFrame(followParallax);
            };
            requestAnimationFrame(followParallax);
        }
    }

    /* ---------- Twinkle layer ----------
       A small number of points fading in and out over the photograph. Kept
       deliberately sparse — this runs every frame. */
    if (!reduceMotion) {
        const canvas = document.querySelector('.twinkle');
        if (canvas && canvas.getContext) {
            const ctx = canvas.getContext('2d');
            const COUNT = 160;
            let stars = [];
            let dpr = 1;

            const seed = () => {
                dpr = Math.min(window.devicePixelRatio || 1, 2);
                canvas.width = window.innerWidth * dpr;
                canvas.height = window.innerHeight * dpr;
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

                stars = Array.from({ length: COUNT }, () => ({
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    r: 0.5 + Math.random() * 1.1,
                    phase: Math.random() * Math.PI * 2,
                    speed: 0.0010 + Math.random() * 0.0022
                }));
            };

            /* Meteors: a pool of concurrent streaks. Concurrency is roughly
               lifetime / spawn-interval, so ~1.6s of life against a ~0.6s interval
               keeps around 2-3 in flight at once. Motion a still photo cannot
               produce, which is what makes the sky read as live rather than static. */
            const MAX_METEORS = 8;
            let meteors = [];
            let nextMeteorAt = 600;

            const spawnMeteor = () => {
                const w = window.innerWidth;
                const h = window.innerHeight;
                // Travel down-left or down-right, always at a shallow, plausible angle
                const dir = Math.random() < 0.5 ? -1 : 1;
                const angle = (18 + Math.random() * 22) * Math.PI / 180;
                const speed = 6 + Math.random() * 5;
                meteors.push({
                    x: dir === 1 ? Math.random() * w * 0.6 : w * 0.4 + Math.random() * w * 0.6,
                    y: Math.random() * h * 0.75,
                    vx: dir * Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    len: 70 + Math.random() * 110,
                    // Varied brightness so they don't all read as identical
                    peak: 0.35 + Math.random() * 0.35,
                    life: 0,
                    ttl: 75 + Math.random() * 50
                });
            };

            const drawMeteors = () => {
                for (const m of meteors) {
                    m.life++;
                    m.x += m.vx;
                    m.y += m.vy;

                    // Fade in over the first fifth of its life, then out
                    const p = m.life / m.ttl;
                    const alpha = (p < 0.2 ? p / 0.2 : 1 - (p - 0.2) / 0.8) * m.peak;
                    if (alpha <= 0) continue;

                    const mag = Math.hypot(m.vx, m.vy);
                    const tailX = m.x - (m.vx / mag) * m.len;
                    const tailY = m.y - (m.vy / mag) * m.len;

                    const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
                    grad.addColorStop(0, `rgba(255, 255, 255, ${alpha.toFixed(3)})`);
                    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

                    ctx.beginPath();
                    ctx.moveTo(m.x, m.y);
                    ctx.lineTo(tailX, tailY);
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = 1.4;
                    ctx.lineCap = 'round';
                    ctx.stroke();
                }

                meteors = meteors.filter(m => m.life < m.ttl);
            };

            const draw = (t) => {
                ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
                for (const s of stars) {
                    // Sinusoidal alpha, floored so stars never fully vanish
                    const alpha = 0.10 + 0.65 * (0.5 + 0.5 * Math.sin(s.phase + t * s.speed));
                    ctx.beginPath();
                    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
                    ctx.fill();
                }

                if (t >= nextMeteorAt && meteors.length < MAX_METEORS) {
                    spawnMeteor();
                    nextMeteorAt = t + 300 + Math.random() * 600;
                }
                drawMeteors();

                requestAnimationFrame(draw);
            };

            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(seed, 150);
            });

            seed();
            requestAnimationFrame(draw);
        }
    }
})();
