// ===== بناء الهيدر =====
function buildHeader() {
  const header = document.getElementById('siteHeader');
  if (!header) return;
  header.innerHTML = `
    <div class="header-inner">
      <div class="header-logo">
        Cinema <span>ROX</span>
      </div>
      <div class="header-search">
        <input
          type="text"
          id="searchInput"
          placeholder="🔍 ابحث عن فيلم..."
          oninput="handleSearch(this.value)"
          class="search-input"
        >
      </div>
    </div>
  `;
}
// ===== تشغيل عند تحميل الصفحة =====
document.addEventListener('DOMContentLoaded', () => {
  buildHeader();
});
