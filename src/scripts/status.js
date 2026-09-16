import { jetztInZeitzone, oeffnungsstatus, statusText } from '../lib/hours.mjs';

function aktualisieren() {
  document.querySelectorAll('[data-oeffnungsstatus]').forEach((el) => {
    const plan = JSON.parse(el.dataset.plan);
    const { day, minutes } = jetztInZeitzone(el.dataset.zeitzone);
    const status = oeffnungsstatus(plan, day, minutes);
    el.textContent = statusText(status);
    el.dataset.offen = String(status.offen);
  });

  document.querySelectorAll('[data-oeffnungstabelle]').forEach((table) => {
    const { day } = jetztInZeitzone(table.dataset.zeitzone);
    table.querySelectorAll('tr[data-tag]').forEach((row) => {
      const heute = Number(row.dataset.tag) === day;
      row.classList.toggle('heute', heute);
      const hinweis = row.querySelector('.heute-hinweis');
      if (heute && !hinweis) {
        const span = document.createElement('span');
        span.className = 'visually-hidden heute-hinweis';
        span.textContent = ' (heute)';
        row.querySelector('th').append(span);
      } else if (!heute && hinweis) {
        hinweis.remove();
      }
    });
  });
}

aktualisieren();
setInterval(aktualisieren, 60_000);
