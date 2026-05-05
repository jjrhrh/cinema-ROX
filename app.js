// ===== NAVIGATION =====
function bnavGo(tab) {
  // إخفاء كل الصفحات
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  // إلغاء تفعيل كل الأزرار
  document.querySelectorAll('.bnav-btn').forEach(b => b.classList.remove('active'));

  const hero = document.getElementById('heroSection');

  if (tab === 'home') {
    document.getElementById('bnavHome').classList.add('active');
    document.getElementById('homePage').classList.add('active');
    if (hero) hero.style.display = '';
  } else if (tab === 'search') {
    document.getElementById('bnavSearch').classList.add('active');
    document.getElementById('searchPage').classList.add('active');
    if (hero) hero.style.display = 'none';
  } else if (tab === 'library') {
    document.getElementById('bnavLibrary').classList.add('active');
    document.getElementById('libraryPage').classList.add('active');
    if (hero) hero.style.display = 'none';
  } else if (tab === 'profile') {
    document.getElementById('bnavProfile').classList.add('active');
    document.getElementById('profilePage').classList.add('active');
    if (hero) hero.style.display = 'none';
  }
  window.scrollTo(0, 0);
}

// ===== ROX MENU =====
let roxOpen = false;
function toggleRoxMenu() {
  roxOpen = !roxOpen;
  const menu    = document.getElementById('roxMenu');
  const overlay = document.getElementById('roxOverlay');
  const btn     = document.getElementById('bnavCenter');
  menu.classList.toggle('hidden', !roxOpen);
  overlay.classList.toggle('hidden', !roxOpen);
  if (btn) btn.style.transform = roxOpen ? 'rotate(45deg) scale(1.1)' : '';
}
// ===== END NAVIGATION =====
