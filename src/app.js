const $ = (selector) => document.querySelector(selector);
const menu = $('.menu-toggle');
const navigation = $('#navigation');
function closeMenu() { navigation.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Abrir menú'); }
menu.addEventListener('click', () => { const open = navigation.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú'); });
navigation.addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && navigation.classList.contains('open')) { closeMenu(); menu.focus(); } });
document.addEventListener('click', (event) => { if (!event.target.closest('.header')) closeMenu(); });

const video = $('#tour-video');
const card = $('#video-card');
const playButton = $('#video-toggle');
const soundButton = $('#sound-toggle');
const nativeButton = $('#native-toggle');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const saveData = navigator.connection?.saveData;
let userPaused = false;
let sufficientlyVisible = false;
let loadingVideo = false;
let playRequest = 0;
let automaticPause = false;
function activateVideo() {
  if (loadingVideo) return;
  loadingVideo = true;
  video.src = video.dataset.src;
  video.load();
}
async function playVideo() {
  activateVideo();
  const request = ++playRequest;
  try {
    await video.play();
    if (request !== playRequest || document.hidden || !sufficientlyVisible) video.pause();
  } catch { /* Browser autoplay may be blocked: the play target stays available. */ }
}
function pauseVideo() { ++playRequest; automaticPause = true; video.pause(); }
playButton.addEventListener('click', () => {
  if (video.paused) { userPaused = false; sufficientlyVisible = true; playVideo(); }
  else { userPaused = true; pauseVideo(); }
});
video.addEventListener('play', () => { card.classList.add('playing'); playButton.setAttribute('aria-label', 'Pausar recorrido'); });
video.addEventListener('pause', () => { if (video.controls && !automaticPause && !video.ended) userPaused = true; automaticPause = false; card.classList.remove('playing'); playButton.setAttribute('aria-label', video.ended ? 'Volver a reproducir recorrido' : 'Reproducir recorrido'); });
video.addEventListener('ended', () => { userPaused = true; });
video.addEventListener('error', () => { $('#video-error').hidden = false; });
video.addEventListener('volumechange', () => {
  soundButton.setAttribute('aria-label', video.muted ? 'Activar sonido' : 'Silenciar video');
  soundButton.setAttribute('aria-pressed', String(!video.muted));
  soundButton.innerHTML = video.muted ? soundButton.dataset.muted : soundButton.dataset.sound;
});
soundButton.dataset.muted = soundButton.innerHTML;
soundButton.dataset.sound = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m11 3-6 5H2v8h3l6 5ZM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg>';
soundButton.addEventListener('click', () => { video.muted = !video.muted; });
nativeButton.addEventListener('click', () => { const enabled = !video.controls; video.controls = enabled; card.classList.toggle('native-controls', enabled); nativeButton.setAttribute('aria-label', enabled ? 'Ocultar controles del video' : 'Mostrar controles del video'); });
video.addEventListener('timeupdate', () => {
  if (!Number.isFinite(video.duration)) return;
  $('#video-progress').style.width = `${video.currentTime / video.duration * 100}%`;
  const seconds = Math.max(0, Math.ceil(video.duration - video.currentTime));
  $('#video-time').textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
});
if ('IntersectionObserver' in window) {
  const nearVideo = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting) && !reducedMotion.matches && !saveData) { activateVideo(); nearVideo.disconnect(); }
  }, { rootMargin: '120px 0px', threshold: 0 });
  nearVideo.observe(card);
  new IntersectionObserver(([entry]) => {
    // A tall portrait remains playable on short landscape screens when most of the viewport shows it.
    const visibleHeight = entry.intersectionRect.height;
    sufficientlyVisible = entry.isIntersecting && visibleHeight >= Math.min(entry.boundingClientRect.height * .55, window.innerHeight * .65);
    if (sufficientlyVisible && !userPaused && !reducedMotion.matches && !saveData && !document.hidden) playVideo();
    else if (!sufficientlyVisible) pauseVideo();
  }, { threshold: [0, .2, .4, .55, .75, 1] }).observe(card);
} else { video.controls = true; card.classList.add('native-controls'); }
document.addEventListener('visibilitychange', () => { if (document.hidden) pauseVideo(); else if (sufficientlyVisible && !userPaused && !reducedMotion.matches && !saveData) playVideo(); });
reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) pauseVideo(); });

const floating = $('.floating-whatsapp');
const suppressed = new Set();
let textCollision = false;
function syncFloating() {
  const hidden = suppressed.size > 0 || textCollision || $('#lightbox').open;
  floating.classList.toggle('suppressed', hidden);
  floating.setAttribute('aria-hidden', String(hidden));
  floating.tabIndex = hidden ? -1 : 0;
}
const collisionTargets = [...document.querySelectorAll('main p,main h2,main h3,main figcaption,main a,.floor-label,.amenities-grid>div')];
let collisionFrame = 0;
function checkTextCollision() {
  collisionFrame = 0;
  const control = floating.getBoundingClientRect();
  textCollision = window.innerWidth < 600 && collisionTargets.some((element) => {
    const box = element.getBoundingClientRect();
    return box.width && box.height && box.bottom > control.top - 8 && box.top < control.bottom + 8 && box.right > control.left - 8 && box.left < control.right + 8;
  });
  syncFloating();
}
function scheduleCollisionCheck() { if (!collisionFrame) collisionFrame = requestAnimationFrame(checkTextCollision); }
window.addEventListener('scroll', scheduleCollisionCheck, { passive: true });
window.addEventListener('resize', scheduleCollisionCheck);
scheduleCollisionCheck();
if ('IntersectionObserver' in window) {
  // Also hide near the gallery and at the hero/contact: it never sits over their controls.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) suppressed.add(entry.target); else suppressed.delete(entry.target); });
    syncFloating();
  }, { rootMargin: '0px 0px 70px 0px', threshold: 0 });
  ['.hero', '#recorrido', '#galeria', '#contacto'].forEach((selector) => observer.observe($(selector)));
}

const gallery = [...document.querySelectorAll('.gallery-item')];
const dialog = $('#lightbox');
const galleryImage = $('#lightbox-image');
let galleryIndex = 0;
let trigger = null;
function showPhoto(index) {
  galleryIndex = (index + gallery.length) % gallery.length;
  const item = gallery[galleryIndex];
  galleryImage.src = item.href;
  galleryImage.alt = item.dataset.caption;
  $('#lightbox-caption').textContent = item.dataset.caption;
  $('#lightbox-count').textContent = `${String(galleryIndex + 1).padStart(2, '0')} / ${gallery.length}`;
}
function openGallery(index, source) {
  trigger = source;
  showPhoto(index);
  dialog.showModal();
  document.body.classList.add('modal-open');
  syncFloating();
  $('#lightbox-close').focus();
}
gallery.forEach((item, index) => item.addEventListener('click', (event) => { event.preventDefault(); openGallery(index, item); }));
$('#see-all').addEventListener('click', (event) => { event.preventDefault(); openGallery(0, event.currentTarget); });
$('#lightbox-close').addEventListener('click', () => dialog.close());
$('#gallery-prev').addEventListener('click', () => showPhoto(galleryIndex - 1));
$('#gallery-next').addEventListener('click', () => showPhoto(galleryIndex + 1));
dialog.addEventListener('keydown', (event) => { if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(galleryIndex - 1); } if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(galleryIndex + 1); } });
dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); syncFloating(); trigger?.focus(); });
let touchStart = null;
galleryImage.addEventListener('touchstart', (event) => { touchStart = event.changedTouches[0].clientX; }, { passive: true });
galleryImage.addEventListener('touchend', (event) => { const delta = event.changedTouches[0].clientX - touchStart; if (touchStart !== null && Math.abs(delta) > 60) showPhoto(galleryIndex + (delta < 0 ? 1 : -1)); touchStart = null; }, { passive: true });
