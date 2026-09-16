// Two-click solution: nothing is requested from Google until the visitor clicks.
document.querySelectorAll('[data-karte]').forEach((box) => {
  const consent = box.querySelector('.karte-consent');
  const button = consent?.querySelector('button');
  if (!consent || !button) return;
  consent.hidden = false;

  button.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = box.dataset.src;
    iframe.title = box.dataset.titel;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.allowFullscreen = true;
    box.replaceChildren(iframe);
    box.classList.add('geladen');
  });
});
