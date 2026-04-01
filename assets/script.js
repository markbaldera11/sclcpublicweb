const SITE_ROOT = 'https://sclcadventist.org';
const POSTS_API = `${SITE_ROOT}/wp-json/wp/v2/posts?_embed&per_page=5`;
const SPOTLIGHT_API = `${SITE_ROOT}/wp-json/wp/v2/posts?categories=33&_embed&per_page=6`;
const FALLBACK_IMAGE = '../media/CAMP2025.jpg';

const fallbackHeroSlides = [
  {
    title: 'South-Central Luzon Conference of the Seventh-day Adventist Church',
    desc: 'Official website of the Seventh-day Adventist Church for the Central Luzon Conference in the Philippines.',
    link: `${SITE_ROOT}/`,
    image: FALLBACK_IMAGE,
    meta: 'Featured Update'
  },
  {
    title: 'Who We Are',
    desc: 'We are a movement called by God to share the eternal gospel of Jesus with every nation, tribe, language, and people.',
    link: `${SITE_ROOT}/our-history/`,
    image: '../media/TEACHER.jpg',
    meta: 'About SCLC'
  },
  {
    title: 'What We Believe',
    desc: 'We believe in a God whose love never fails and in the soon return of Jesus to restore all things.',
    link: 'https://adventist.org/beliefs',
    image: '../media/SEMINAR.jpg',
    meta: 'Beliefs'
  }
];

const fallbackSpotlightSlides = [
  {
    title: 'Spotlight Story',
    desc: 'Use this section to feature important ministry stories, updates, and announcements from the conference.',
    //link: `${SITE_ROOT}/news/`,
    image: FALLBACK_IMAGE
  },
  {
    title: 'Community Mission',
    desc: 'Share stories of outreach, discipleship, and service that highlight the work of churches and departments.',
    //link: `${SITE_ROOT}/ministries/`,
    image: '../media/TOUR.jpg'
  }
];

function stripHtml(html = '') {
  const div = document.createElement('div');
  div.innerHTML = html;
  div.querySelectorAll('script, style, noscript, iframe, figure').forEach((node) => node.remove());
  const paragraphs = [...div.querySelectorAll('p')]
    .map((p) => (p.textContent || '').replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  const fullText = paragraphs.length ? paragraphs.join(' ') : (div.textContent || '').replace(/\s+/g, ' ').trim();
  return fullText;
}

function truncate(text = '', maxLength = 180) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

function getFeaturedImage(post) {
  return post?._embedded?.['wp:featuredmedia']?.[0]?.source_url || FALLBACK_IMAGE;
}

function formatPostDate(post) {
  if (!post?.date) return 'Latest Update';
  return new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function mapHeroPost(post) {
  return {
    title: post?.title?.rendered?.trim() || 'Untitled Post',
    desc: truncate(stripHtml(post?.excerpt?.rendered || post?.content?.rendered || ''), 220),
    link: post?.link || `${SITE_ROOT}/news/`,
    image: getFeaturedImage(post),
    meta: formatPostDate(post)
  };
}

function mapSpotlightPost(post) {
  return {
    title: post?.title?.rendered?.trim() || 'Untitled Story',
    desc: truncate(stripHtml(post?.content?.rendered || post?.excerpt?.rendered || ''), 170),
    link: post?.link || `${SITE_ROOT}/news/`,
    image: getFeaturedImage(post)
  };
}

class HeroSlider {
  constructor(items) {
    this.items = items;
    this.current = 0;
    this.timer = null;

    this.background = document.getElementById('heroBackground');
    this.dots = document.getElementById('heroDots');
    this.cards = document.getElementById('heroCards');
    this.title = document.getElementById('heroTitle');
    this.desc = document.getElementById('heroDesc');
    this.button = document.getElementById('heroBtn');
    this.prev = document.getElementById('heroPrev');
    this.next = document.getElementById('heroNext');
  }

  init() {
    this.renderBackgrounds();
    this.renderDots();
    this.renderCards();
    this.bind();
    this.update(0);
    this.start();
  }

  renderBackgrounds() {
    this.background.innerHTML = this.items
      .map((item, index) => `<img class="hero-bg-image ${index === 0 ? 'active' : ''}" src="${item.image}" alt="${item.title}">`)
      .join('');
  }

  renderDots() {
    this.dots.innerHTML = this.items
      .map((item, index) => `<button class="hero-dot ${index === 0 ? 'active' : ''}" type="button" aria-label="Go to slide ${index + 1}" data-index="${index}"></button>`)
      .join('');
  }

  renderCards() {
    this.cards.innerHTML = this.items
      .map((item, index) => `
        <a class="hero-card ${index === 0 ? 'active' : ''}" href="${item.link}" target="_blank" rel="noopener" data-index="${index}">
          <img src="${item.image}" alt="${item.title}">
          <div class="card-overlay">
            <div class="card-title">${item.title}</div>
            <div class="card-meta">${item.meta}</div>
          </div>
        </a>
      `)
      .join('');
  }

  bind() {
    this.prev.addEventListener('click', () => this.go(this.current - 1));
    this.next.addEventListener('click', () => this.go(this.current + 1));

    this.dots.addEventListener('click', (event) => {
      const button = event.target.closest('.hero-dot');
      if (!button) return;
      this.go(Number(button.dataset.index));
    });

    this.cards.addEventListener('click', (event) => {
      const card = event.target.closest('.hero-card');
      if (!card) return;
      const index = Number(card.dataset.index);
      if (index !== this.current) {
        event.preventDefault();
        this.go(index);
      }
    });

    this.cards.addEventListener('mouseenter', () => this.stop());
    this.cards.addEventListener('mouseleave', () => this.start());
  }

  normalize(index) {
    if (index < 0) return this.items.length - 1;
    if (index >= this.items.length) return 0;
    return index;
  }

  go(index) {
    this.current = this.normalize(index);
    this.update(this.current);
    this.start();
  }

  update(index) {
    const item = this.items[index];
    if (!item) return;

    this.title.innerHTML = item.title;
    this.desc.textContent = item.desc;
    this.button.href = item.link;

    [...this.background.querySelectorAll('.hero-bg-image')].forEach((img, i) => {
      img.classList.toggle('active', i === index);
    });

    [...this.dots.querySelectorAll('.hero-dot')].forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    const cards = [...this.cards.querySelectorAll('.hero-card')];
    cards.forEach((card, i) => card.classList.toggle('active', i === index));

    cards[index]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  start() {
    this.stop();
    this.timer = window.setInterval(() => this.go(this.current + 1), 6000);
  }

  stop() {
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }
}

async function loadJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

async function initHero() {
  let items = fallbackHeroSlides;

  try {
    const posts = await loadJson(POSTS_API);
    const mapped = posts.map(mapHeroPost).filter((item) => item.title && item.link);
    if (mapped.length) items = mapped;
  } catch (error) {
    console.error('Hero posts failed to load:', error);
  }

  const slider = new HeroSlider(items);
  slider.init();
}

function createSpotlightCard(item) {
  return `
    <a class="spotlight-card text-decoration-none" href="${item.link}" target="_blank" rel="noopener">
      <div class="spotlight-label">FEATURED</div>
      <div class="spotlight-image-wrap">
        <img src="${item.image}" alt="${item.title}">
      </div>
      <div class="spotlight-body">
        <h3>${item.title}</h3>
        <p>${item.desc}</p>
      </div>
    </a>
  `;
}

async function initSpotlight() {
  const track = document.getElementById('spotlightTrack');
  let items = fallbackSpotlightSlides;

  try {
    const posts = await loadJson(SPOTLIGHT_API);
    const mapped = posts.map(mapSpotlightPost).filter((item) => item.title && item.link);
    if (mapped.length) items = mapped;
  } catch (error) {
    console.error('Spotlight posts failed to load:', error);
  }

  track.innerHTML = items.map(createSpotlightCard).join('');

  const scrollAmount = () => Math.min(track.clientWidth * 0.85, 520);

  document.getElementById('spotlightPrev')?.addEventListener('click', () => {
    track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
  });

  document.getElementById('spotlightNext')?.addEventListener('click', () => {
    track.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initHero();
  initSpotlight();
});