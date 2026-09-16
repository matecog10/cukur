// Motion modelled on the Empyre landing page: reveal on scroll, header that hides on the way down
// and returns on the way up, and a number scramble. Content stays visible without JavaScript and
// nothing moves when the visitor asks for reduced motion.
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Header: lifted once off the top, hidden while travelling down past the hero. */
const header = document.querySelector('.site-header');
if (header) {
  let prev = scrollY;
  let ticking = false;
  const setHidden = (hidden) => {
    header.classList.toggle('is-hidden', hidden);
    root.classList.toggle('header-hidden', hidden);
  };
  const update = () => {
    ticking = false;
    const y = scrollY;
    header.classList.toggle('is-lifted', y > 8);
    const menuOpen = document.querySelector('.hauptnav.offen');
    if (reduce || menuOpen) setHidden(false);
    else if (y > prev && y > 260) setHidden(true);
    // A 4px floor so trackpad jitter does not flash the bar in and out.
    else if (prev - y > 4) setHidden(false);
    prev = y;
  };
  addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  header.addEventListener('focusin', () => setHidden(false));
  update();
}

/* Scramble: digits cycle and settle left to right, like Empyre's MetricScramble. */
function scramble(el) {
  const final = el.textContent;
  let iteration = 0;
  const id = setInterval(() => {
    el.textContent = [...final]
      .map((ch, i) => (/\d/.test(ch) && i >= iteration ? String(Math.floor(Math.random() * 10)) : ch))
      .join('');
    iteration += 0.5;
    if (iteration >= final.length) {
      el.textContent = final;
      clearInterval(id);
    }
  }, 30);
}

/* Reveal on scroll, once. A plain position check instead of IntersectionObserver: it also runs
   when the page opens on an anchor, returns from the back/forward cache or was loaded in a
   background tab, so nothing can stay invisible. Anything in view or already scrolled past shows. */
let pending = [...document.querySelectorAll('[data-reveal], [data-scramble]')];
if (reduce) {
  pending.forEach((el) => el.classList.add('is-in'));
  pending = [];
} else if (pending.length) {
  root.classList.add('motion');
  const sweep = () => {
    const limit = innerHeight - 60;
    pending = pending.filter((el) => {
      if (el.getBoundingClientRect().top >= limit) return true;
      el.classList.add('is-in');
      if (el.hasAttribute('data-scramble')) scramble(el);
      return false;
    });
    if (!pending.length) {
      removeEventListener('scroll', sweep);
      removeEventListener('resize', sweep);
    }
  };
  addEventListener('scroll', sweep, { passive: true });
  addEventListener('resize', sweep, { passive: true });
  addEventListener('load', sweep);
  addEventListener('pageshow', sweep);
  document.addEventListener('visibilitychange', sweep);
  sweep();
  setTimeout(sweep, 1200);
}
