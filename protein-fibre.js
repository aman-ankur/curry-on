'use strict';
const filters = document.querySelector('.snack-filters');
const snackCards = [...document.querySelectorAll('.snack-card')];
const filterNames = {all: 'All snacks', protein: 'Protein ≥18 g', fibre: 'Fibre ≥5 g', 'no-cook': 'No cooking today'};
filters.hidden = false;
filters.addEventListener('click', event => {
  const button = event.target.closest('button[data-filter]');
  if (!button) return;
  const filter = button.dataset.filter;
  filters.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  snackCards.forEach(card => { card.hidden = filter !== 'all' && !card.dataset.tags.split(' ').includes(filter); });
  const visible = snackCards.filter(card => !card.hidden).length;
  document.querySelector('#snack-count').textContent = `${visible} of ${snackCards.length} options · ${filterNames[filter]}.${filter === 'no-cook' ? ' Chana chaat assumes ready-cooked beans.' : ' Estimates apply to the full listed serving.'}`;
});

// Include every snack and its alternatives in print, then restore the screen view.
let printState;
window.addEventListener('beforeprint', () => {
  if (printState) return;
  printState = [...document.querySelectorAll('details')].map(detail => [detail, detail.open]);
  printState.forEach(([detail]) => { detail.open = true; });
});
window.addEventListener('afterprint', () => {
  if (!printState) return;
  printState.forEach(([detail, wasOpen]) => { detail.open = wasOpen; });
  printState = undefined;
});
document.querySelectorAll('.print').forEach(button => button.addEventListener('click', () => window.print()));
const sections = [...document.querySelectorAll('section[id]')];
const navigation = [...document.querySelectorAll('.nav a[href^="#"]')];
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navigation.forEach(link => {
      const active = link.hash === `#${entry.target.id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  });
}, {rootMargin: '-10% 0px -65% 0px'});
sections.forEach(section => observer.observe(section));
