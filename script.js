// Preloader
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('preloader').classList.add('hidden');
    }, 800);
});

// ====== CARD SWAP (HERO) ======
(function() {
    const container = document.getElementById('cardSwap');
    if (!container || typeof gsap === 'undefined') return;

    const cards = Array.prototype.slice.call(container.children);

    const CARD_DIST = 60;
    const VERT_DIST = 70;
    const DELAY = 5000;
    const SKEW = 6;
    const config = {
        ease: 'elastic.out(0.6,0.9)',
        durDrop: 2,
        durMove: 2,
        durReturn: 2,
        promoteOverlap: 0.9,
        returnDelay: 0.05
    };

    const makeSlot = (i, total) => ({
        x: i * CARD_DIST,
        y: -i * VERT_DIST,
        z: -i * CARD_DIST * 1.5,
        zIndex: total - i
    });

    const placeNow = (el, slot, skew) => gsap.set(el, {
        x: slot.x,
        y: slot.y,
        z: slot.z,
        xPercent: -50,
        yPercent: -50,
        skewY: skew,
        transformOrigin: 'center center',
        zIndex: slot.zIndex,
        force3D: true
    });

    const total = cards.length;
    cards.forEach((el, i) => placeNow(el, makeSlot(i, total), SKEW));

    let order = cards.map((_, i) => i);
    let tlRef = null;

    const swap = () => {
        if (order.length < 2) return;

        const [front, ...rest] = order;
        const elFront = cards[front];
        const tl = gsap.timeline();
        tlRef = tl;

        tl.to(elFront, {
            y: '+=500',
            duration: config.durDrop,
            ease: config.ease
        });

        tl.addLabel('promote', '-=' + (config.durDrop * config.promoteOverlap));
        rest.forEach((idx, i) => {
            const el = cards[idx];
            const slot = makeSlot(i, total);
            tl.set(el, { zIndex: slot.zIndex }, 'promote');
            tl.to(el, {
                x: slot.x,
                y: slot.y,
                z: slot.z,
                duration: config.durMove,
                ease: config.ease
            }, 'promote+=' + (i * 0.15));
        });

        const backSlot = makeSlot(total - 1, total);
        tl.addLabel('return', 'promote+=' + (config.durMove * config.returnDelay));
        tl.call(function() {
            gsap.set(elFront, { zIndex: backSlot.zIndex });
        }, undefined, 'return');
        tl.to(elFront, {
            x: backSlot.x,
            y: backSlot.y,
            z: backSlot.z,
            duration: config.durReturn,
            ease: config.ease
        }, 'return');

        tl.call(function() {
            order = rest.concat(front);
        });
    };

    swap();
    window.setInterval(swap, DELAY);
})();

// ====== TYPEWRITER LOOP ======
(function() {
    const el = document.querySelector('.typewriter-text');
    if (!el) return;

    const words = ['soluções digitais', 'Aplicativos', 'Sistemas'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;

    function getSpeed() {
        if (isPaused) return 1800;
        if (isDeleting) return 50;
        return 80 + Math.random() * 40;
    }

    function tick() {
        const currentWord = words[wordIndex];

        if (isPaused) {
            isPaused = false;
            isDeleting = true;
            tick();
            return;
        }

        if (!isDeleting) {
            charIndex++;
            el.textContent = currentWord.substring(0, charIndex);
            el.style.width = 'auto';

            if (charIndex === currentWord.length) {
                isPaused = true;
                setTimeout(tick, getSpeed());
                return;
            }
        } else {
            charIndex--;
            el.textContent = currentWord.substring(0, charIndex);

            if (charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
            }
        }

        setTimeout(tick, getSpeed());
    }

    // Start after initial hero animation
    setTimeout(tick, 1200);
})();

// Header scroll
const header = document.getElementById('header');
const scrollTop = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    if (window.scrollY > 400) {
        scrollTop.classList.add('visible');
    } else {
        scrollTop.classList.remove('visible');
    }
});

// Mobile menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
});
function closeMobile() {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
}
mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) closeMobile();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) closeMobile();
});

// Cursor glow
const cursorGlow = document.getElementById('cursorGlow');
document.addEventListener('mousemove', (e) => {
    cursorGlow.style.transform = `translate(${e.clientX - 150}px, ${e.clientY - 150}px)`;
});

// Scroll reveal
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Service cards staggered animation
const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const delay = entry.target.getAttribute('data-delay') || 0;
            setTimeout(() => {
                entry.target.classList.add('visible');
                entry.target.addEventListener('animationend', () => {
                    entry.target.classList.add('animated');
                }, { once: true });
            }, parseInt(delay));
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card').forEach(card => cardObserver.observe(card));

// ====== BORDER GLOW (SERVICE CARDS) ======
(function() {
    function getEdgeProximity(el, x, y) {
        const rect = el.getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const dx = x - cx;
        const dy = y - cy;
        let kx = Infinity;
        let ky = Infinity;
        if (dx !== 0) kx = cx / Math.abs(dx);
        if (dy !== 0) ky = cy / Math.abs(dy);
        return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    }
    function getCursorAngle(el, x, y) {
        const rect = el.getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const dx = x - cx;
        const dy = y - cy;
        if (dx === 0 && dy === 0) return 0;
        const radians = Math.atan2(dy, dx);
        let degrees = radians * (180 / Math.PI) + 90;
        if (degrees < 0) degrees += 360;
        return degrees;
    }
    document.querySelectorAll('.border-glow-card').forEach((card) => {
        card.addEventListener('pointermove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const edge = getEdgeProximity(card, x, y);
            const angle = getCursorAngle(card, x, y);
            card.style.setProperty('--edge-proximity', (edge * 100).toFixed(3));
            card.style.setProperty('--cursor-angle', angle.toFixed(3) + 'deg');
        });
    });
})();

// Portfolio staggered animation
const portfolioObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
                entry.target.addEventListener('animationend', () => {
                    entry.target.classList.add('animated');
                }, { once: true });
            }, i * 80);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.portfolio-item').forEach(item => portfolioObserver.observe(item));

// ====== PORTFOLIO MODAL ======
const modal = document.getElementById('portfolioModal');
const modalImg = document.getElementById('modalImg');
const modalVideo = document.getElementById('modalVideo');
const modalCaption = document.getElementById('modalCaption');
let currentProjectIndex = 0;
const portfolioItems = document.querySelectorAll('.portfolio-item');

function openModal(index) {
    currentProjectIndex = index;
    const item = portfolioItems[index];
    const type = item.getAttribute('data-type');
    const caption = item.querySelector('.portfolio-overlay span');

    // Hide both, show the right one
    modalImg.style.display = 'none';
    modalVideo.style.display = 'none';
    modalVideo.pause();
    modalVideo.removeAttribute('src');

    if (type === 'video') {
        const source = item.querySelector('video source');
        if (source) {
            modalVideo.src = source.src;
            modalVideo.load();
            modalVideo.style.display = 'block';
            modalVideo.play().catch(() => {});
        }
    } else {
        const img = item.querySelector('.portfolio-img');
        if (img) {
            modalImg.src = img.src;
            modalImg.alt = img.alt;
            modalImg.style.display = 'block';
        }
    }

    if (caption) {
        modalCaption.textContent = caption.textContent;
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('active');
    modalVideo.pause();
    document.body.style.overflow = '';
}

function navigateModal(direction) {
    currentProjectIndex += direction;
    if (currentProjectIndex < 0) currentProjectIndex = portfolioItems.length - 1;
    if (currentProjectIndex >= portfolioItems.length) currentProjectIndex = 0;
    openModal(currentProjectIndex);
}

// Click events on portfolio items
portfolioItems.forEach((item, index) => {
    item.addEventListener('click', () => openModal(index));
});

// Close on backdrop click
modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);

// Close button
modal.querySelector('.modal-close').addEventListener('click', closeModal);

// Navigation buttons
modal.querySelector('.modal-prev').addEventListener('click', (e) => {
    e.stopPropagation();
    navigateModal(-1);
});
modal.querySelector('.modal-next').addEventListener('click', (e) => {
    e.stopPropagation();
    navigateModal(1);
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') navigateModal(-1);
    if (e.key === 'ArrowRight') navigateModal(1);
});

// ====== VIDEO HOVER PLAY ======
portfolioItems.forEach(item => {
    const video = item.querySelector('.portfolio-video');
    if (!video) return;

    item.addEventListener('mouseenter', () => {
        video.play().catch(() => {});
    });
    item.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0;
    });
});

// Form AJAX submission + popup
window.addEventListener('load', () => {
    const form = document.getElementById('contact-form');
    if (!form) return;

    function showPopup(success, text) {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(255,255,255,0.6);z-index:99998;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s;';
        const popup = document.createElement('div');
        popup.style.cssText = 'background:white;border:1px solid ' + (success ? '#28C840' : '#E31837') + ';border-radius:16px;padding:2.5rem 3rem;text-align:center;color:#0A0A0A;font-family:Inter,sans-serif;box-shadow:0 20px 60px rgba(0,0,0,0.5);max-width:400px;width:90%;transform:scale(0.9);transition:transform 0.3s;';
        const icon = success ? '&#10003;' : '&#10007;';
        const bg = success ? 'rgba(40,200,64,0.15)' : 'rgba(227,24,55,0.15)';
        popup.innerHTML = '<div style="width:60px;height:60px;border-radius:50%;background:' + bg + ';display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;font-size:1.8rem;">' + icon + '</div><h3 style="margin-bottom:0.5rem;font-size:1.3rem;">' + (success ? 'Mensagem enviada!' : 'Erro ao enviar') + '</h3><p style="color:#888;font-size:0.95rem;line-height:1.6;">' + text + '</p>';
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        requestAnimationFrame(() => { overlay.style.opacity = '1'; popup.style.transform = 'scale(1)'; });
        const close = () => { overlay.style.opacity = '0'; popup.style.transform = 'scale(0.9)'; setTimeout(() => overlay.remove(), 300); };
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        setTimeout(close, 4000);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const original = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        btn.disabled = true;
        try {
            const data = new FormData(form);
            const res = await fetch('enviar.php', { method: 'POST', body: data });
            const json = await res.json();
            if (json.ok) {
                form.reset();
                showPopup(true, 'Recebemos sua mensagem. Entraremos em contato em breve.');
            } else {
                showPopup(false, json.error || 'Tente novamente.');
            }
        } catch {
            showPopup(false, 'Erro de conexão. Tente novamente.');
        }
        btn.innerHTML = original;
        btn.disabled = false;
    });
});

// ====== PWA INSTALL ======
(function() {
    let deferredPrompt = null;
    const btnAndroid = document.getElementById('pwaInstallAndroid');
    const btnIOS = document.getElementById('pwaInstallIOS');
    const footerPwa = document.getElementById('footerPwa');

    if (!footerPwa) return;

    function hideButtons() {
        footerPwa.classList.add('hidden');
    }

    function isStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true ||
               document.referrer.includes('android-app://');
    }

    if (isStandalone()) {
        hideButtons();
        return;
    }

    var ua = navigator.userAgent;
    var isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var isAndroid = /Android/i.test(ua);
    var isChrome = /Chrome/i.test(ua) && !/Edg|OPR|Brave/i.test(ua);
    var isSamsung = /SamsungBrowser/i.test(ua);
    var isFirefox = /Firefox/i.test(ua);

    // Always show buttons
    footerPwa.classList.remove('hidden');

    // Hide Android button on iOS
    if (isIOS && btnAndroid) {
        btnAndroid.style.display = 'none';
    }
    // Hide iOS button on Android
    if (isAndroid && btnIOS) {
        btnIOS.style.display = 'none';
    }

    function showInstallModal(title, text) {
        var overlay = document.createElement('div');
        overlay.className = 'pwa-modal-overlay';
        var box = document.createElement('div');
        box.className = 'pwa-modal-box';
        box.innerHTML = '<h3>' + title + '</h3><p>' + text + '</p><button class="pwa-modal-close">Entendi</button>';
        overlay.appendChild(box);
        document.body.appendChild(overlay);
        box.querySelector('button').onclick = function() { overlay.remove(); };
        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    }

    function installAndroid() {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(function() {
                deferredPrompt = null;
                hideButtons();
            });
        } else {
            var text = 'Para instalar, toque no menu do navegador <i class="fas fa-ellipsis-v"></i> e selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à Tela Inicial"</strong>.';
            if (isSamsung) {
                text = 'Toque no menu <i class="fas fa-ellipsis-v"></i> e selecione <strong>"Adicionar página a"</strong> e depois <strong>"Tela Inicial"</strong>.';
            } else if (isFirefox) {
                text = 'Toque no menu <i class="fas fa-ellipsis-v"></i> e selecione <strong>"Instalar"</strong> ou <strong>"Adicionar à Tela de Início"</strong>.';
            }
            showInstallModal('Instalar WD App', text);
        }
    }

    function installIOS() {
        showInstallModal('Instalar WD App',
            'Toque no botão <strong>Compartilhar</strong> <i class="fas fa-share-from-square"></i> na barra inferior e depois em <strong>Adicionar à Tela de Início</strong>.');
    }

    if (btnAndroid) btnAndroid.addEventListener('click', installAndroid);
    if (btnIOS) btnIOS.addEventListener('click', installIOS);

    window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault();
        deferredPrompt = e;
    });

    window.addEventListener('appinstalled', function() {
        deferredPrompt = null;
        hideButtons();
    });
})();