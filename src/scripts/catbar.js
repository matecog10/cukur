const bar = document.querySelector('[data-catbar]');

if (bar) {
  const list = bar.querySelector('ul');
  const links = [...bar.querySelectorAll('a')];
  const sections = links.map((a) => document.getElementById(a.hash.slice(1))).filter(Boolean);
  let current = null;
  let ticking = false;

  const setActive = (id) => {
    if (id === current) return;
    current = id;
    links.forEach((a) => {
      const active = a.hash === `#${id}`;
      if (active) {
        a.setAttribute('aria-current', 'true');
        list.scrollLeft = a.offsetLeft - (list.clientWidth - a.offsetWidth) / 2;
      } else {
        a.removeAttribute('aria-current');
      }
    });
  };

  const update = () => {
    ticking = false;
    const offset = bar.getBoundingClientRect().bottom + 24;
    let active = sections[0]?.id;
    for (const s of sections) {
      if (s.getBoundingClientRect().top <= offset) active = s.id;
    }
    setActive(active);
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
  // Opening on an anchor jumps without a scroll frame in background tabs, so also update directly.
  addEventListener('load', update);
  addEventListener('hashchange', update);
  update();
}
