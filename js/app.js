// ============================================================
// ONE TRADE — TypeScript Application Core  v1.1
// Premium Forex Investment Platform — Supabase Connected
// Project: uhxlogllucxqhereqsev.supabase.co
// Trade. Invest. Grow.
// ============================================================
// ─────────────────── Type Converters ───────────────────
const supaPostToLocal = (p) => ({
    id: p.id,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    category: p.category,
    author: p.author,
    date: p.created_at ? p.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    emoji: p.emoji || '📊',
    status: p.status,
    readTime: p.read_time || 5,
});
const supaCommentToLocal = (c) => ({
    id: c.id,
    postId: c.post_id,
    name: c.author_name,
    email: c.author_email || '',
    text: c.body,
    date: c.created_at ? c.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
});
// ─────────────────── Constants ───────────────────
const ADMIN_PASSCODE = 'sham2026';
const STORAGE_KEY_POSTS = 'onetrade_posts';
const STORAGE_KEY_COMMENTS = 'onetrade_comments';
const STORAGE_KEY_AUTH = 'onetrade_admin_auth';
const FOREX_PAIRS = [
    { pair: 'EUR/USD', price: '1.0845', change: '+0.31%', up: true },
    { pair: 'GBP/USD', price: '1.2734', change: '+0.42%', up: true },
    { pair: 'USD/JPY', price: '149.82', change: '-0.18%', up: false },
    { pair: 'USD/CHF', price: '0.8912', change: '-0.09%', up: false },
    { pair: 'AUD/USD', price: '0.6542', change: '+0.22%', up: true },
    { pair: 'USD/CAD', price: '1.3571', change: '+0.14%', up: true },
    { pair: 'NZD/USD', price: '0.5981', change: '-0.07%', up: false },
    { pair: 'EUR/GBP', price: '0.8512', change: '+0.11%', up: true },
    { pair: 'EUR/JPY', price: '162.43', change: '+0.25%', up: true },
    { pair: 'GBP/JPY', price: '190.84', change: '+0.37%', up: true },
    { pair: 'XAU/USD', price: '2,641', change: '+0.75%', up: true },
    { pair: 'BTC/USD', price: '67,420', change: '+2.14%', up: true },
];
// Seed posts used as localStorage fallback when Supabase is unreachable
const SEED_POSTS = [
    {
        id: 'seed-p1',
        title: 'The Complete Guide to EUR/USD Trading in 2024',
        excerpt: 'Master the world\'s most traded currency pair with proven entry/exit strategies used by professional traders.',
        content: '###Introduction###\nThe EUR/USD pair accounts for over 24% of all global forex transactions. Understanding its dynamics is fundamental to becoming a successful trader.\n\n###Proven Entry Strategies###\nOne Trade analysts recommend a multi-timeframe approach. Begin with the H4 chart, drop to H1 for structure, and use M15 for precision entries.\n\n###Conclusion###\nDownload the One Trade app to access our live EUR/USD signals and expert commentary.',
        category: 'analysis', author: 'One Trade Research Team',
        date: '2024-12-15', emoji: '📊', status: 'published', readTime: 7
    },
    {
        id: 'seed-p2',
        title: 'Forex Risk Management: The Rule Every Profitable Trader Lives By',
        excerpt: 'Discover the exact risk management framework used by institutional traders to protect capital and ensure long-term profitability.',
        content: '###Why Risk Management Is Everything###\nAsk any consistently profitable forex trader their secret, and 9 out of 10 will say: it\'s about managing losers, not finding winners.\n\n###The 1% Rule###\nNever risk more than 1% of your account on any single trade. This ensures even 20 consecutive losses only reduces your account by 20%.\n\n###Conclusion###\nDownload the One Trade app to access our built-in position size calculator.',
        category: 'education', author: 'One Trade Editorial',
        date: '2024-12-10', emoji: '🎓', status: 'published', readTime: 6
    },
    {
        id: 'seed-p3',
        title: 'Inside the London Session: How Institutional Money Moves Forex',
        excerpt: 'The London session generates more volume than any other. Learn how smart money operates during these hours.',
        content: '###The Most Important 8 Hours in Forex###\nThe London session (8AM-4PM GMT) accounts for 35% of all daily forex transactions.\n\n###The London Kill Zone###\nThe highest probability window is 7:00-10:00 AM GMT — explosive volatility with clear directional moves.\n\n###Conclusion###\nMaster it using One Trade live session analysis and real-time signal alerts.',
        category: 'strategy', author: 'Senior Analyst, One Trade',
        date: '2024-12-05', emoji: '🏦', status: 'published', readTime: 8
    }
];
// ─────────────────── Utilities ───────────────────
const generateId = () => Math.random().toString(36).substring(2, 10).toUpperCase() + Date.now().toString(36);
const formatDate = (dateStr) => {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    catch (_a) {
        return dateStr;
    }
};
const escapeHtml = (str) => {
    const map = {
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, c => map[c] || c);
};
const debounce = (fn, delay) => {
    let timer;
    return ((...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    });
};
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
// ─────────────────── LocalStorage Store (fallback) ───────────────────
class Store {
    static get(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        }
        catch (_a) {
            return fallback;
        }
    }
    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        }
        catch ( /* quota */_a) { /* quota */ }
    }
}
// ─────────────────── Toast ───────────────────
class Toast {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        this.container.setAttribute('role', 'status');
        this.container.setAttribute('aria-live', 'polite');
        document.body.appendChild(this.container);
    }
    show(message, type = 'info', duration = 4500) {
        var _a;
        const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
        const toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        toast.setAttribute('role', 'alert');
        toast.innerHTML =
            '<span class="toast-icon" aria-hidden="true">' + icons[type] + '</span>' +
                '<span class="toast-msg">' + escapeHtml(message) + '</span>' +
                '<button class="toast-close" aria-label="Close">✕</button>';
        this.container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('toast-enter'));
        const close = () => {
            toast.classList.add('toast-exit');
            toast.addEventListener('transitionend', () => toast.remove(), { once: true });
        };
        (_a = toast.querySelector('.toast-close')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', close);
        setTimeout(close, duration);
    }
}
// ─────────────────── Navbar ───────────────────
class Navbar {
    constructor() {
        this.nav = document.getElementById('navbar');
        this.hamburger = document.getElementById('hamburgerBtn');
        this.navLinks = document.getElementById('navLinks');
        this.navActions = document.getElementById('navActions');
        this.init();
    }
    init() {
        var _a;
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
        (_a = this.hamburger) === null || _a === void 0 ? void 0 : _a.addEventListener('click', this.toggleMenu.bind(this));
        this.setActiveLink();
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.navbar'))
                this.closeMenu();
        });
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href') || '';
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        // For #home, scroll to very top (above the spacer div)
                        if (href === '#home') {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                        else {
                            const navH = this.nav.offsetHeight;
                            const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
                            window.scrollTo({ top, behavior: 'smooth' });
                        }
                    }
                    this.closeMenu();
                }
            });
        });
    }
    handleScroll() {
        var _a;
        (_a = this.nav) === null || _a === void 0 ? void 0 : _a.classList.toggle('scrolled', window.scrollY > 30);
        this.updateActiveOnScroll();
    }
    toggleMenu() {
        var _a, _b, _c, _d, _e;
        const open = (_b = (_a = this.navLinks) === null || _a === void 0 ? void 0 : _a.classList.toggle('open')) !== null && _b !== void 0 ? _b : false;
        (_c = this.navActions) === null || _c === void 0 ? void 0 : _c.classList.toggle('open', open);
        (_d = this.hamburger) === null || _d === void 0 ? void 0 : _d.classList.toggle('open', open);
        (_e = this.hamburger) === null || _e === void 0 ? void 0 : _e.setAttribute('aria-expanded', String(open));
    }
    closeMenu() {
        var _a, _b, _c, _d;
        (_a = this.navLinks) === null || _a === void 0 ? void 0 : _a.classList.remove('open');
        (_b = this.navActions) === null || _b === void 0 ? void 0 : _b.classList.remove('open');
        (_c = this.hamburger) === null || _c === void 0 ? void 0 : _c.classList.remove('open');
        (_d = this.hamburger) === null || _d === void 0 ? void 0 : _d.setAttribute('aria-expanded', 'false');
    }
    setActiveLink() {
        const home = document.querySelector('.nav-link[href="#home"]');
        if (home)
            home.classList.add('active');
    }
    updateActiveOnScroll() {
        let current = '';
        document.querySelectorAll('section[id]').forEach(sec => {
            if (sec.getBoundingClientRect().top <= 100)
                current = sec.id;
        });
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (current && link.getAttribute('href') === '#' + current)
                link.classList.add('active');
        });
    }
}
// ─────────────────── Forex Ticker ───────────────────
class ForexTicker {
    constructor(pairs) {
        this.track = document.getElementById('tickerTrack');
        this.pairs = pairs;
        this.render();
        this.startFlicker();
    }
    render() {
        if (!this.track)
            return;
        const items = [...this.pairs, ...this.pairs];
        this.track.innerHTML = items.map(p => `
      <span class="ticker-item" aria-label="${p.pair} ${p.price} ${p.change}">
        <span class="ticker-pair">${p.pair}</span>
        <span class="ticker-price" id="tp-${p.pair.replace('/', '-')}">${p.price}</span>
        <span class="ticker-change ${p.up ? 'up' : 'down'}">${p.change}</span>
      </span>
      <span aria-hidden="true" style="color:rgba(0,212,255,.3);font-size:.7rem;">●</span>
    `).join('');
    }
    startFlicker() {
        setInterval(() => {
            this.pairs.forEach(p => {
                const base = parseFloat(p.price.replace(',', ''));
                const delta = (Math.random() - 0.5) * 0.002 * base;
                const val = base + delta;
                const el = document.getElementById('tp-' + p.pair.replace('/', '-'));
                if (el) {
                    el.textContent = base > 1000
                        ? val.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                        : val.toFixed(4);
                }
            });
        }, 2500);
    }
}
// ─────────────────── Scroll Animator ───────────────────
class ScrollAnimator {
    constructor() {
        this.observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    this.observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08 });
        this.observe();
    }
    observe() {
        document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-up')
            .forEach(el => { if (!el.classList.contains('visible'))
            this.observer.observe(el); });
    }
}
// ─────────────────── Counter Animation ───────────────────
const animateCounter = (el, target, duration = 2200) => {
    const t0 = performance.now();
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    // Don't use toLocaleString on values like 2 ($2B+) — just format as integer
    const fmt = (n) => n >= 10000 ? n.toLocaleString() : String(n);
    const tick = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        const v = Math.floor((1 - Math.pow(1 - p, 3)) * target);
        el.textContent = prefix + fmt(v) + suffix;
        if (p < 1)
            requestAnimationFrame(tick);
        else
            el.textContent = prefix + fmt(target) + suffix;
    };
    requestAnimationFrame(tick);
};
const initCounters = () => {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length)
        return;
    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const el = e.target;
                animateCounter(el, parseInt(el.dataset.counter || '0', 10));
                io.unobserve(el);
            }
        });
    }, { threshold: 0.4 });
    counters.forEach(el => io.observe(el));
};
// ─────────────────── Live Price Simulation ───────────────────
const startLivePriceSimulation = () => {
    const priceEl = document.getElementById('livePrice');
    const changeEl = document.getElementById('liveChange');
    if (!priceEl || !changeEl)
        return;
    let base = 1.2734;
    setInterval(() => {
        base = Math.max(1.2600, Math.min(1.2900, base + (Math.random() - 0.5) * 0.0008));
        const pct = ((base - 1.2698) / 1.2698 * 100).toFixed(2);
        const up = parseFloat(pct) >= 0;
        priceEl.textContent = base.toFixed(4);
        changeEl.textContent = (up ? '▲ +' : '▼ ') + Math.abs(parseFloat(pct)).toFixed(2) + '%';
        changeEl.style.color = up ? '#4ade80' : '#f87171';
    }, 1800);
};
// ─────────────────── Blog Manager — Supabase + localStorage fallback ───────────────────
class BlogManager {
    constructor(toast, anim) {
        this.posts = [];
        this.comments = [];
        this.currentPost = null;
        this.activeFilter = 'all';
        this.useSupa = false;
        this.realtimeSub = null;
        this.toast = toast;
        this.anim = anim;
        this.useSupa = typeof PostsService !== 'undefined';
        void this.init();
    }
    // ── Init ─────────────────────────────────────────────
    async init() {
        await this.loadData();
        this.renderBlog();
        this.bindEvents();
    }
    // ── Data Layer ───────────────────────────────────────
    async loadData() {
        if (this.useSupa) {
            try {
                const [sbPosts, sbComments] = await Promise.all([
                    PostsService.getPublished(),
                    CommentsService.getAll(),
                ]);
                this.posts = sbPosts.map(supaPostToLocal);
                this.comments = sbComments.map(supaCommentToLocal);
                return;
            }
            catch (err) {
                console.warn('[OneTrade] Supabase unavailable, using localStorage:', err);
                this.useSupa = false;
            }
        }
        // localStorage fallback
        this.posts = Store.get(STORAGE_KEY_POSTS, SEED_POSTS);
        this.comments = Store.get(STORAGE_KEY_COMMENTS, []);
        const ids = this.posts.map(p => p.id);
        SEED_POSTS.forEach(sp => { if (!ids.includes(sp.id))
            this.posts.push(sp); });
        Store.set(STORAGE_KEY_POSTS, this.posts);
    }
    saveLocal() {
        if (!this.useSupa) {
            Store.set(STORAGE_KEY_POSTS, this.posts);
            Store.set(STORAGE_KEY_COMMENTS, this.comments);
        }
    }
    // ── Category Label ──────────────────────────────────
    catLabel(cat) {
        const m = {
            analysis: 'Market Analysis', education: 'Education',
            strategy: 'Strategy', news: 'News'
        };
        return m[cat] || cat;
    }
    // ── Blog Grid ────────────────────────────────────────
    renderBlog(filter = 'all') {
        const grid = document.getElementById('blogGrid');
        if (!grid)
            return;
        const visible = this.posts.filter(p => p.status === 'published' && (filter === 'all' || p.category === filter));
        if (!visible.length) {
            grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-state-icon" aria-hidden="true">📰</div>
        <p class="empty-state-text">No posts in this category yet. Check back soon!</p>
      </div>`;
            return;
        }
        grid.innerHTML = visible.map(p => {
            const cnt = this.comments.filter(c => c.postId === p.id).length;
            return `
      <article class="blog-card reveal" role="listitem" aria-label="${escapeHtml(p.title)}">
        <div class="blog-card-image" aria-hidden="true">
          <span>${p.emoji}</span>
          <div class="blog-cat-badge">
            <span class="badge badge-gold">${this.catLabel(p.category)}</span>
          </div>
        </div>
        <div class="blog-card-body">
          <div class="blog-meta">
            <span class="blog-date">📅 ${formatDate(p.date)}</span>
            <span class="blog-author">✍️ ${escapeHtml(p.author)}</span>
            <span class="blog-read-time">⏱ ${p.readTime} min read</span>
          </div>
          <h3 class="blog-title">${escapeHtml(p.title)}</h3>
          <p class="blog-excerpt">${escapeHtml(p.excerpt)}</p>
          <div class="blog-footer">
            <button class="blog-read-more" data-open-post="${p.id}"
              aria-label="Read ${escapeHtml(p.title)}">Read Article →</button>
            <span class="blog-comments-count" aria-label="${cnt} comments">💬 ${cnt}</span>
          </div>
        </div>
      </article>`;
        }).join('');
        this.anim.observe();
        grid.querySelectorAll('[data-open-post]').forEach(btn => {
            btn.addEventListener('click', () => void this.openPost(btn.dataset.openPost || ''));
        });
    }
    // ── Events ───────────────────────────────────────────
    bindEvents() {
        var _a, _b, _c, _d;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeFilter = btn.dataset.cat || 'all';
                this.renderBlog(this.activeFilter);
            });
        });
        (_a = document.getElementById('loadMoreBtn')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => this.toast.show('All articles loaded. New posts coming soon!', 'info'));
        (_b = document.getElementById('postModalClose')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => this.closePost());
        (_c = document.getElementById('postOverlay')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', e => {
            if (e.target === document.getElementById('postOverlay'))
                this.closePost();
        });
        document.addEventListener('keydown', e => { if (e.key === 'Escape')
            this.closePost(); });
        (_d = document.getElementById('commentForm')) === null || _d === void 0 ? void 0 : _d.addEventListener('submit', e => {
            e.preventDefault();
            void this.submitComment();
        });
    }
    // ── Post Modal ───────────────────────────────────────
    async openPost(id) {
        var _a;
        // Refresh comments from Supabase for this post
        if (this.useSupa) {
            try {
                const fresh = await CommentsService.getByPost(id);
                this.comments = this.comments.filter(c => c.postId !== id)
                    .concat(fresh.map(supaCommentToLocal));
            }
            catch ( /* use cached */_b) { /* use cached */ }
        }
        const post = this.posts.find(p => p.id === id);
        if (!post)
            return;
        this.currentPost = post;
        const setEl = (elId, val) => {
            const el = document.getElementById(elId);
            if (el)
                el.textContent = val;
        };
        const setHtml = (elId, val) => {
            const el = document.getElementById(elId);
            if (el)
                el.innerHTML = val;
        };
        setEl('postModalHero', post.emoji);
        setEl('postModalTitle', post.title);
        setHtml('postModalMeta', `<span class="badge badge-gold">${this.catLabel(post.category)}</span>` +
            `<span class="blog-date">📅 ${formatDate(post.date)}</span>` +
            `<span class="blog-author">✍️ ${escapeHtml(post.author)}</span>` +
            `<span class="blog-read-time">⏱ ${post.readTime} min read</span>`);
        setHtml('postModalContent', post.content.split('\n').map(line => {
            const h = line.match(/^###(.+)###$/);
            if (h)
                return `<h3>${escapeHtml(h[1])}</h3>`;
            return line.trim() ? `<p>${escapeHtml(line)}</p>` : '';
        }).join(''));
        this.renderComments(id);
        (_a = document.getElementById('postOverlay')) === null || _a === void 0 ? void 0 : _a.classList.add('open');
        document.body.style.overflow = 'hidden';
        // Subscribe to live new comments via Supabase Realtime
        if (this.useSupa) {
            if (this.realtimeSub)
                RealtimeService.unsubscribeAll();
            this.realtimeSub = RealtimeService.subscribeToComments(id, (nc) => {
                const local = supaCommentToLocal(nc);
                if (!this.comments.find(c => c.id === local.id)) {
                    this.comments.push(local);
                    this.renderComments(id);
                }
            });
        }
    }
    closePost() {
        var _a;
        (_a = document.getElementById('postOverlay')) === null || _a === void 0 ? void 0 : _a.classList.remove('open');
        document.body.style.overflow = '';
        this.currentPost = null;
        if (this.useSupa) {
            RealtimeService.unsubscribeAll();
            this.realtimeSub = null;
        }
    }
    // ── Comments ─────────────────────────────────────────
    renderComments(postId) {
        const list = document.getElementById('commentsList');
        const label = document.getElementById('commentsCountLabel');
        if (!list)
            return;
        const items = this.comments.filter(c => c.postId === postId);
        if (label)
            label.textContent = `Comments (${items.length})`;
        if (!items.length) {
            list.innerHTML = `<div class="comments-empty">
        No comments yet. Be the first to share your thoughts!</div>`;
            return;
        }
        list.innerHTML = items.map(c => `
      <div class="comment-item" role="listitem">
        <div class="comment-avatar" aria-hidden="true">
          ${escapeHtml(c.name.charAt(0).toUpperCase())}
        </div>
        <div class="comment-body">
          <div class="comment-header">
            <span class="comment-name">${escapeHtml(c.name)}</span>
            <span class="comment-time">${formatDate(c.date)}</span>
          </div>
          <p class="comment-text">${escapeHtml(c.text)}</p>
        </div>
      </div>`).join('');
    }
    async submitComment() {
        if (!this.currentPost)
            return;
        const nameEl = document.getElementById('commentName');
        const emailEl = document.getElementById('commentEmail');
        const textEl = document.getElementById('commentText');
        const btnEl = document.getElementById('commentSubmitBtn');
        const name = (nameEl === null || nameEl === void 0 ? void 0 : nameEl.value.trim()) || '';
        const email = (emailEl === null || emailEl === void 0 ? void 0 : emailEl.value.trim()) || '';
        const text = (textEl === null || textEl === void 0 ? void 0 : textEl.value.trim()) || '';
        if (!name) {
            this.toast.show('Please enter your name.', 'error');
            return;
        }
        if (!text) {
            this.toast.show('Please enter a comment.', 'error');
            return;
        }
        if (text.length < 5) {
            this.toast.show('Comment is too short.', 'error');
            return;
        }
        if (btnEl) {
            btnEl.disabled = true;
            btnEl.textContent = 'Posting...';
        }
        try {
            if (this.useSupa) {
                const created = await CommentsService.create({
                    postId: this.currentPost.id, name, email, text
                });
                const local = supaCommentToLocal(created);
                if (!this.comments.find(c => c.id === local.id))
                    this.comments.push(local);
            }
            else {
                const c = {
                    id: generateId(), postId: this.currentPost.id,
                    name, email, text, date: new Date().toISOString().split('T')[0]
                };
                this.comments.push(c);
                this.saveLocal();
            }
            this.renderComments(this.currentPost.id);
            this.renderBlog(this.activeFilter);
            nameEl.value = '';
            emailEl.value = '';
            textEl.value = '';
            this.toast.show('Comment posted! Thank you.', 'success');
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Network error';
            this.toast.show('Could not post comment: ' + msg, 'error');
        }
        finally {
            if (btnEl) {
                btnEl.disabled = false;
                btnEl.textContent = 'Post Comment';
            }
        }
    }
    // ── Public API (used by AdminManager) ───────────────
    getPosts() { return this.posts; }
    getComments() { return this.comments; }
    isSupabase() { return this.useSupa; }
    async addPost(post) {
        if (this.useSupa) {
            const created = await PostsService.create({
                title: post.title, excerpt: post.excerpt, content: post.content,
                category: post.category, emoji: post.emoji, author: post.author,
                status: post.status, read_time: post.readTime
            });
            this.posts.unshift(supaPostToLocal(created));
        }
        else {
            this.posts.unshift(post);
            this.saveLocal();
        }
        this.renderBlog(this.activeFilter);
    }
    async updatePost(id, updates) {
        if (this.useSupa) {
            const updated = await PostsService.update(id, {
                title: updates.title, excerpt: updates.excerpt, content: updates.content,
                category: updates.category, emoji: updates.emoji, author: updates.author,
                status: updates.status, read_time: updates.readTime
            });
            const idx = this.posts.findIndex(p => p.id === id);
            if (idx !== -1)
                this.posts[idx] = supaPostToLocal(updated);
        }
        else {
            const idx = this.posts.findIndex(p => p.id === id);
            if (idx !== -1) {
                this.posts[idx] = Object.assign(Object.assign({}, this.posts[idx]), updates);
                this.saveLocal();
            }
        }
        this.renderBlog(this.activeFilter);
    }
    async deletePost(id) {
        if (this.useSupa)
            await PostsService.delete(id);
        this.posts = this.posts.filter(p => p.id !== id);
        this.comments = this.comments.filter(c => c.postId !== id);
        this.saveLocal();
        this.renderBlog(this.activeFilter);
    }
    async deleteComment(id) {
        if (this.useSupa)
            await CommentsService.delete(id);
        this.comments = this.comments.filter(c => c.id !== id);
        this.saveLocal();
    }
    async refreshAll() {
        await this.loadData();
        this.renderBlog(this.activeFilter);
    }
}
// ─────────────────── Admin Manager ───────────────────
class AdminManager {
    constructor(toast, blog) {
        this.authenticated = false;
        this.editingId = null;
        this.toast = toast;
        this.blog = blog;
        // Never auto-restore admin session — always require fresh passcode on every page load
        this.authenticated = false;
        Store.set(STORAGE_KEY_AUTH, false);
        this.bindGate();
        this.bindPanel();
    }
    // ── Gate ─────────────────────────────────────────────
    bindGate() {
        var _a, _b, _c, _d;
        (_a = document.getElementById('openAdminGateBtn')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => this.showGate());
        (_b = document.getElementById('adminGateClose')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => this.hideGate());
        (_c = document.getElementById('adminLoginBtn')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => this.attemptLogin());
        const inp = document.getElementById('adminPasscodeInput');
        inp === null || inp === void 0 ? void 0 : inp.addEventListener('keydown', e => { if (e.key === 'Enter')
            this.attemptLogin(); });
        (_d = document.getElementById('togglePasscode')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => {
            if (!inp)
                return;
            const show = inp.type === 'password';
            inp.type = show ? 'text' : 'password';
            document.getElementById('togglePasscode').textContent = show ? '🙈' : '👁';
        });
    }
    showGate() {
        const gate = document.getElementById('adminGate');
        if (!gate)
            return;
        gate.style.display = 'flex';
        // Force reflow so the transition from opacity:0 → 1 fires
        void gate.offsetHeight;
        gate.classList.remove('hidden');
        const inp = document.getElementById('adminPasscodeInput');
        inp === null || inp === void 0 ? void 0 : inp.focus();
        const err = document.getElementById('adminErrorMsg');
        if (err)
            err.textContent = '';
    }
    hideGate() {
        const gate = document.getElementById('adminGate');
        if (!gate)
            return;
        gate.classList.add('hidden');
        setTimeout(() => { gate.style.display = 'none'; }, 350);
        const inp = document.getElementById('adminPasscodeInput');
        if (inp)
            inp.value = '';
        const err = document.getElementById('adminErrorMsg');
        if (err)
            err.textContent = '';
    }
    attemptLogin() {
        const inp = document.getElementById('adminPasscodeInput');
        const errMsg = document.getElementById('adminErrorMsg');
        if (inp.value === ADMIN_PASSCODE) {
            this.authenticated = true;
            Store.set(STORAGE_KEY_AUTH, true);
            this.hideGate();
            this.openPanel();
            this.toast.show('Welcome, Administrator.', 'success');
        }
        else {
            errMsg.textContent = 'Incorrect passcode. Please try again.';
            inp.classList.add('error');
            inp.value = '';
            setTimeout(() => inp.classList.remove('error'), 600);
            inp.focus();
        }
    }
    // ── Panel ─────────────────────────────────────────────
    openPanel() {
        const panel = document.getElementById('adminPanel');
        if (!panel)
            return;
        panel.style.display = 'flex';
        // Force reflow before adding class so CSS transition fires
        void panel.offsetHeight;
        panel.classList.add('open');
        document.body.style.overflow = 'hidden';
        void this.refreshDashboard();
        this.renderPostsTable();
        void this.renderAdminComments();
    }
    closePanel() {
        const panel = document.getElementById('adminPanel');
        if (!panel)
            return;
        panel.classList.remove('open');
        // Hide after transition completes
        setTimeout(() => { panel.style.display = 'none'; }, 350);
        document.body.style.overflow = '';
        this.authenticated = false;
        Store.set(STORAGE_KEY_AUTH, false);
    }
    bindPanel() {
        var _a, _b, _c, _d;
        (_a = document.getElementById('adminLogoutBtn')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            if (confirm('Logout from admin panel?')) {
                this.closePanel();
                this.toast.show('Logged out successfully.', 'info');
            }
        });
        document.querySelectorAll('.sidebar-btn[data-tab]').forEach(btn => {
            btn.addEventListener('click', () => {
                var _a;
                document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const tab = btn.dataset.tab || '';
                document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
                (_a = document.getElementById('tab-' + tab)) === null || _a === void 0 ? void 0 : _a.classList.add('active');
                if (tab === 'manage-posts')
                    this.renderPostsTable();
                if (tab === 'comments')
                    void this.renderAdminComments();
                if (tab === 'dashboard')
                    void this.refreshDashboard();
            });
        });
        (_b = document.getElementById('newPostShortcut')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => this.switchTab('new-post'));
        (_c = document.getElementById('savePostBtn')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => void this.savePost());
        (_d = document.getElementById('cancelEditBtn')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => this.cancelEdit());
    }
    switchTab(tabId) {
        var _a;
        document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        (_a = document.getElementById('tab-' + tabId)) === null || _a === void 0 ? void 0 : _a.classList.add('active');
    }
    // ── Dashboard ────────────────────────────────────────
    async refreshDashboard() {
        let total = 0, published = 0, drafts = 0, commentCount = 0;
        if (this.blog.isSupabase()) {
            try {
                const [stats, cnt] = await Promise.all([
                    PostsService.getStats(),
                    CommentsService.getCount(),
                ]);
                total = stats.total;
                published = stats.published;
                drafts = stats.drafts;
                commentCount = cnt;
                // Also refresh blog posts in memory
                await this.blog.refreshAll();
            }
            catch ( /* fall through to local */_a) { /* fall through to local */ }
        }
        if (total === 0) {
            const posts = this.blog.getPosts();
            const comms = this.blog.getComments();
            total = posts.length;
            published = posts.filter(p => p.status === 'published').length;
            drafts = posts.filter(p => p.status === 'draft').length;
            commentCount = comms.length;
        }
        const set = (id, v) => {
            const el = document.getElementById(id);
            if (el)
                el.textContent = String(v);
        };
        set('adminStatPosts', total);
        set('adminStatComments', commentCount);
        set('adminStatPublished', published);
        set('adminStatDrafts', drafts);
        // Recent posts list
        const wrap = document.getElementById('recentPostsWrap');
        const posts = this.blog.getPosts();
        if (wrap) {
            wrap.innerHTML = posts.length
                ? `<h3 style="font-family:var(--font-display);font-size:1rem;font-weight:700;
               color:var(--gold-bright);margin-bottom:14px;">Recent Posts</h3>
           <div style="display:flex;flex-direction:column;gap:10px;">
           ${posts.slice(0, 5).map(p => `
             <div style="display:flex;align-items:center;justify-content:space-between;
                  padding:12px 16px;background:rgba(255,255,255,.03);
                  border:1px solid rgba(255,255,255,.07);border-radius:10px;">
               <span style="color:var(--white);font-size:.875rem;font-weight:600;">
                 ${p.emoji} ${escapeHtml(p.title)}</span>
               <span class="badge badge-${p.status === 'published' ? 'gold' : 'blue'}">
                 ${p.status}</span>
             </div>`).join('')}
           </div>`
                : `<div class="empty-state">
             <div class="empty-state-icon">📰</div>
             <p class="empty-state-text">No posts yet.</p>
           </div>`;
        }
    }
    // ── Posts Table ──────────────────────────────────────
    renderPostsTable() {
        const tbody = document.getElementById('postsTableBody');
        if (!tbody)
            return;
        const posts = this.blog.getPosts();
        if (!posts.length) {
            tbody.innerHTML = `<tr><td colspan="6">
        <div class="empty-state">
          <div class="empty-state-icon">📰</div>
          <p>No posts yet. Create your first post.</p>
        </div></td></tr>`;
            return;
        }
        tbody.innerHTML = posts.map(p => `
      <tr>
        <td><span class="table-title" title="${escapeHtml(p.title)}">
          ${p.emoji} ${escapeHtml(p.title)}</span></td>
        <td><span class="badge badge-gold">${this.catLabel(p.category)}</span></td>
        <td>${escapeHtml(p.author)}</td>
        <td>${formatDate(p.date)}</td>
        <td><span class="badge badge-${p.status === 'published' ? 'gold' : 'blue'}">
          ${p.status}</span></td>
        <td>
          <div class="table-actions">
            <button class="tbl-btn tbl-btn-edit" data-edit-id="${p.id}">Edit</button>
            <button class="tbl-btn tbl-btn-delete" data-del-id="${p.id}">Delete</button>
          </div>
        </td>
      </tr>`).join('');
        tbody.querySelectorAll('[data-edit-id]').forEach(btn => btn.addEventListener('click', () => this.editPost(btn.dataset.editId || '')));
        tbody.querySelectorAll('[data-del-id]').forEach(btn => btn.addEventListener('click', () => {
            if (!confirm('Delete this post? This cannot be undone.'))
                return;
            void this.blog.deletePost(btn.dataset.delId || '').then(() => {
                this.renderPostsTable();
                void this.refreshDashboard();
                this.toast.show('Post deleted.', 'info');
            }).catch((e) => {
                this.toast.show('Delete failed: ' + (e instanceof Error ? e.message : ''), 'error');
            });
        }));
    }
    // ── Admin Comments ───────────────────────────────────
    async renderAdminComments() {
        const wrap = document.getElementById('adminCommentsList');
        if (!wrap)
            return;
        const comments = this.blog.getComments();
        const posts = this.blog.getPosts();
        if (!comments.length) {
            wrap.innerHTML = `<div class="empty-state">
        <div class="empty-state-icon">💬</div><p>No comments yet.</p></div>`;
            return;
        }
        wrap.innerHTML = comments.map(c => {
            const post = posts.find(p => p.id === c.postId);
            return `
      <div class="comment-item" role="listitem" style="margin-bottom:12px;">
        <div class="comment-avatar">${escapeHtml(c.name.charAt(0).toUpperCase())}</div>
        <div class="comment-body" style="flex:1;">
          <div class="comment-header">
            <span class="comment-name">${escapeHtml(c.name)}</span>
            <span class="comment-time">${formatDate(c.date)}</span>
            <span class="badge badge-blue" style="margin-left:8px;">
              ${post ? escapeHtml(post.title.substring(0, 28)) + '…' : 'Unknown post'}</span>
          </div>
          <p class="comment-text">${escapeHtml(c.text)}</p>
        </div>
        <button class="tbl-btn tbl-btn-delete" style="align-self:flex-start;margin-left:12px;"
          data-del-comment="${c.id}">Delete</button>
      </div>`;
        }).join('');
        wrap.querySelectorAll('[data-del-comment]').forEach(btn => btn.addEventListener('click', () => {
            if (!confirm('Delete this comment?'))
                return;
            void this.blog.deleteComment(btn.dataset.delComment || '').then(() => {
                void this.renderAdminComments();
                void this.refreshDashboard();
                this.toast.show('Comment deleted.', 'info');
            }).catch((e) => {
                this.toast.show('Delete failed: ' + (e instanceof Error ? e.message : ''), 'error');
            });
        }));
    }
    // ── Post Editor ──────────────────────────────────────
    editPost(id) {
        const post = this.blog.getPosts().find(p => p.id === id);
        if (!post)
            return;
        this.editingId = id;
        this.switchTab('new-post');
        const set = (elId, val) => {
            const el = document.getElementById(elId);
            if (el)
                el.value = val;
        };
        document.getElementById('editorTitle').textContent = '✏️ Edit Post';
        set('editPostId', id);
        set('postTitle', post.title);
        set('postCategory', post.category);
        set('postEmoji', post.emoji);
        set('postExcerpt', post.excerpt);
        set('postContent', post.content);
        set('postAuthor', post.author);
        set('postStatus', post.status);
        document.getElementById('cancelEditBtn').style.display = 'inline-flex';
    }
    cancelEdit() {
        this.editingId = null;
        this.clearEditor();
        document.getElementById('cancelEditBtn').style.display = 'none';
        document.getElementById('editorTitle').textContent = '✏️ New Post';
    }
    clearEditor() {
        ['postTitle', 'postCategory', 'postEmoji', 'postExcerpt', 'postContent', 'postAuthor'].forEach(id => {
            const el = document.getElementById(id);
            if (el)
                el.value = '';
        });
        document.getElementById('postStatus').value = 'published';
        document.getElementById('editPostId').value = '';
    }
    async savePost() {
        const g = (id) => { var _a; return ((_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.value.trim()) || ''; };
        const title = g('postTitle');
        const category = g('postCategory');
        const emoji = g('postEmoji') || '📊';
        const excerpt = g('postExcerpt');
        const content = g('postContent');
        const author = g('postAuthor');
        const status = g('postStatus');
        const btn = document.getElementById('savePostBtn');
        if (!title) {
            this.toast.show('Title is required.', 'error');
            return;
        }
        if (!category) {
            this.toast.show('Category is required.', 'error');
            return;
        }
        if (!excerpt) {
            this.toast.show('Excerpt is required.', 'error');
            return;
        }
        if (!content) {
            this.toast.show('Content is required.', 'error');
            return;
        }
        if (!author) {
            this.toast.show('Author is required.', 'error');
            return;
        }
        btn.disabled = true;
        btn.textContent = this.editingId ? '💾 Saving…' : '💾 Publishing…';
        const readTime = Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
        try {
            if (this.editingId) {
                await this.blog.updatePost(this.editingId, { title, category, emoji, excerpt, content, author, status, readTime });
                this.toast.show('Post updated successfully!', 'success');
                this.cancelEdit();
            }
            else {
                const post = {
                    id: generateId(), title, category, emoji, excerpt, content, author,
                    status, readTime, date: new Date().toISOString().split('T')[0]
                };
                await this.blog.addPost(post);
                this.toast.show('Post published successfully!', 'success');
                this.clearEditor();
            }
            void this.refreshDashboard();
            this.renderPostsTable();
        }
        catch (err) {
            this.toast.show('Save failed: ' + (err instanceof Error ? err.message : ''), 'error');
        }
        finally {
            btn.disabled = false;
            btn.textContent = '💾 Save & Publish';
        }
    }
    catLabel(cat) {
        const m = {
            analysis: 'Market Analysis', education: 'Education',
            strategy: 'Strategy', news: 'News'
        };
        return m[cat] || cat;
    }
}
// ─────────────────── Toast Styles (injected) ───────────────────
const injectToastStyles = () => {
    const style = document.createElement('style');
    style.textContent = [
        '.toast-container{position:fixed;bottom:28px;right:28px;z-index:9999;',
        'display:flex;flex-direction:column;gap:10px;pointer-events:none;}',
        '.toast{display:flex;align-items:center;gap:12px;padding:14px 18px;',
        'border-radius:14px;background:rgba(5,15,32,.96);',
        'border:1px solid rgba(255,255,255,.1);',
        'box-shadow:0 20px 50px rgba(0,0,0,.55),0 0 30px rgba(0,212,255,.06);',
        'backdrop-filter:blur(20px);font-size:.9rem;font-weight:500;',
        'min-width:280px;max-width:380px;pointer-events:all;',
        'opacity:0;transform:translateX(40px);transition:opacity .32s,transform .32s;}',
        '.toast.toast-enter{opacity:1;transform:none;}',
        '.toast.toast-exit{opacity:0;transform:translateX(40px);}',
        '.toast-success{border-left:4px solid #f59e0b;}',
        '.toast-error{border-left:4px solid #ef4444;}',
        '.toast-info{border-left:4px solid #00d4ff;}',
        '.toast-warning{border-left:4px solid #f59e0b;}',
        '.toast-icon{font-size:1rem;font-weight:800;flex-shrink:0;}',
        '.toast-success .toast-icon,.toast-warning .toast-icon{color:#f59e0b;}',
        '.toast-error .toast-icon{color:#ef4444;}',
        '.toast-info .toast-icon{color:#00d4ff;}',
        '.toast-msg{flex:1;color:rgba(255,255,255,.88);}',
        '.toast-close{background:none;border:none;color:rgba(255,255,255,.4);',
        'font-size:.85rem;cursor:pointer;padding:2px 4px;border-radius:4px;}',
        '.toast-close:hover{color:rgba(255,255,255,.8);}',
    ].join('');
    document.head.appendChild(style);
};
// ─────────────────── Newsletter ───────────────────
const initNewsletter = (toast) => {
    const form = document.getElementById('newsletterForm');
    if (!form)
        return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailEl = document.getElementById('newsletterEmail');
        const btn = form.querySelector('button[type="submit"]');
        const email = (emailEl === null || emailEl === void 0 ? void 0 : emailEl.value.trim()) || '';
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.show('Please enter a valid email address.', 'error');
            return;
        }
        btn.disabled = true;
        btn.textContent = 'Subscribing…';
        try {
            if (typeof NewsletterService !== 'undefined') {
                await NewsletterService.subscribe(email);
            }
            toast.show('🎉 Subscribed! Weekly market insights coming your way.', 'success', 6000);
            emailEl.value = '';
        }
        catch (_a) {
            toast.show('Subscription failed. Please try again.', 'error');
        }
        finally {
            btn.disabled = false;
            btn.textContent = 'Subscribe';
        }
    });
};
// ─────────────────── Contact ───────────────────
const initContact = (toast) => {
    // Contact cards use mailto / tel links — no form handler needed for now
    // Any future contact form can wire up to ContactService.send() here
    void toast; // keep reference
};
// ─────────────────── Footer Year ───────────────────
const setFooterYear = () => {
    const el = document.getElementById('footerYear');
    if (el)
        el.textContent = String(new Date().getFullYear());
};
// ─────────────────── DOM Init ───────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Clear any stale admin session from previous visits — admin must re-authenticate every time
    localStorage.removeItem('onetrade_admin_auth');
    injectToastStyles();
    const toast = new Toast();
    const anim = new ScrollAnimator();
    // Core UI
    const navbar = new Navbar();
    const ticker = new ForexTicker(FOREX_PAIRS);
    // Blog + Admin (Supabase-backed, localStorage fallback)
    const blog = new BlogManager(toast, anim);
    const admin = new AdminManager(toast, blog);
    // Utilities
    initCounters();
    startLivePriceSimulation();
    initNewsletter(toast);
    initContact(toast);
    setFooterYear();
    // Suppress unused-var warnings
    void navbar;
    void ticker;
    void admin;
    void debounce;
    void clamp;
    // Expose to inline handlers
    const g = window;
    g._toast = toast;
    console.log('%c ONE TRADE v1.1 — Supabase Connected ✅ ', 'background:#050d1a;color:#00d4ff;font-weight:900;font-size:13px;' +
        'padding:8px 16px;border-radius:8px;border:1px solid rgba(0,212,255,.3);');
});
//# sourceMappingURL=app.js.map