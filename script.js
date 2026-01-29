const enterBtn = document.getElementById('enterBtn');
const landing = document.getElementById('landing');
const playground = document.getElementById('playground');
const aboutOrb = document.getElementById('aboutOrb');
const aboutCard = document.getElementById('aboutCard');

enterBtn.addEventListener('click', () => {
  landing.classList.add('hidden');
  playground.classList.remove('hidden');
});

aboutOrb.addEventListener('click', () => {
  aboutCard.classList.remove('hidden');
});

document.addEventListener('mousemove', (e) => {
  if (aboutCard.classList.contains('hidden')) return;
  const x = (window.innerWidth / 2 - e.clientX) / 25;
  const y = (window.innerHeight / 2 - e.clientY) / 25;
  aboutCard.style.transform = `translate(${x}px, ${y}px)`;
});
