(() => {
    const canvas = document.createElement("canvas");
    canvas.id = "zoniva-starfield";

    Object.assign(canvas.style, {
        position: "fixed",
        inset: "0",
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: "0"
    });

    document.body.prepend(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let stars = [];
    let shootingStars = [];
    let animationId = null;
    let lastShootingStar = 0;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        width = window.innerWidth;
        height = window.innerHeight;

        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const count = Math.min(
            280,
            Math.max(100, Math.floor((width * height) / 5000))
        );

        stars = Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.5 + 0.4,
            alpha: Math.random() * 0.7 + 0.2,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.002 + 0.0005,
            drift: Math.random() * 0.18 + 0.03
        }));
    }

    function createShootingStar() {
        if (shootingStars.length >= 3) return;

        const fromLeft = Math.random() < 0.5;

        shootingStars.push({
            x: fromLeft
                ? Math.random() * width * 0.7
                : width * 0.3 + Math.random() * width * 0.7,

            y: Math.random() * height * 0.65,
            vx: 5 + Math.random() * 5,
            vy: 2 + Math.random() * 3,
            length: 100 + Math.random() * 150,
            life: 1,
            decay: 0.006 + Math.random() * 0.004,
            width: 1.5 + Math.random() * 1.5
        });
    }

    function drawStar(star, time) {
        const twinkle = 0.5 +
            Math.sin(time * star.speed + star.phase) * 0.5;

        star.y += star.drift * 0.12;

        if (star.y > height) {
            star.y = 0;
            star.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);

        ctx.fillStyle =
            `rgba(190, 220, 255, ${star.alpha * (0.45 + twinkle * 0.55)})`;

        ctx.fill();
    }

    function drawShootingStar(star) {
        const tailX = star.x - star.vx * star.length / 8;
        const tailY = star.y - star.vy * star.length / 8;

        const gradient = ctx.createLinearGradient(
            tailX, tailY, star.x, star.y
        );

        gradient.addColorStop(0, "rgba(40, 100, 255, 0)");
        gradient.addColorStop(0.6, `rgba(55, 140, 255, ${star.life * 0.5})`);
        gradient.addColorStop(1, `rgba(220, 240, 255, ${star.life})`);

        ctx.save();

        ctx.shadowBlur = 14;
        ctx.shadowColor = "#368bff";
        ctx.strokeStyle = gradient;
        ctx.lineWidth = star.width;
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(star.x, star.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(235, 248, 255, ${star.life})`;
        ctx.fill();

        ctx.restore();
    }

    function animate(time = 0) {
        animationId = requestAnimationFrame(animate);

        if (document.hidden) return;

        ctx.clearRect(0, 0, width, height);

        stars.forEach(star => drawStar(star, time));

        if (!reducedMotion.matches && time - lastShootingStar > 1200) {
            createShootingStar();
            lastShootingStar = time;
        }

        shootingStars.forEach(star => {
            drawShootingStar(star);

            star.x += star.vx;
            star.y += star.vy;
            star.life -= star.decay;
        });

        shootingStars = shootingStars.filter(star =>
            star.life > 0 &&
            star.x < width + 250 &&
            star.y < height + 250
        );
    }

    function start() {
        if (animationId !== null) return;
        animationId = requestAnimationFrame(animate);
    }

    function stop() {
        if (animationId !== null) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stop();
        } else {
            start();
        }
    });

    window.addEventListener("resize", resize);

    resize();
    start();
})();