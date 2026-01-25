document.addEventListener('DOMContentLoaded', () => {
    const navHtml = `
<header class="main-header">
  <nav class="navbar" aria-label="Barra de navegación principal">
    <div class="brand">
      <img class="brand-logo" src="/frontend/Public/resources/Modulo-1/logo.png" alt="Logo SIGRA" onerror="this.style.display='none'"/>
      <span>SIGRA</span>
    </div>

    <div class="nav-links">
      <a href="../../landing/index.html">Inicio</a>
      <a href="manager.view.html">Mis Cursos</a>
      <a href="schedule.html">Mi Horario</a>
      <a href="final-report.html">Boletín</a>
    </div>

    <div class="profile-menu" aria-label="Menú de perfil">
      <button class="bell" type="button" aria-label="Notificaciones">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </button>
      <div class="profile-wrapper">
        <button class="profile-button" id="profile-button" type="button" aria-haspopup="true" aria-expanded="false">
          <span class="profile-avatar" id="profile-avatar" aria-hidden="true">--</span>
          <span class="sr-only">Abrir menú de perfil</span>
        </button>
        <div class="profile-dropdown" id="profile-dropdown" role="menu" style="display:none;">
          <div class="profile-summary">
            <div class="profile-name" id="profile-name">Usuario</div>
            <div class="profile-email" id="profile-email">Sin sesión</div>
          </div>
          <button class="logout-btn" id="logout-button-nav" type="button">Cerrar sesión</button>
        </div>
      </div>
    </div>
  </nav>
</header>
`;

    document.querySelectorAll('nav.navbar').forEach(nav => {
      nav.outerHTML = navHtml;
    });

    const API_AUTH = 'http://localhost:5200/api/auth';
    const profileBtn = document.getElementById('profile-button');
    const profileDropdown = document.getElementById('profile-dropdown');
    const profileAvatar = document.getElementById('profile-avatar');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const logoutBtn = document.getElementById('logout-button-nav');

    function getStoredUser() {
      // CORRECCIÓN: Usar la llave exacta que tienes en Application tab
      const raw = localStorage.getItem('sigra_user');
      if (!raw) return null;
      try { return JSON.parse(raw); } catch (_) { return null; }
    }

    function clearSession() {
      localStorage.removeItem('sigra_token');
      localStorage.removeItem('sigra_user');
      localStorage.removeItem('sigra_user_raw');
    }

    function setProfileUI() {
      const user = getStoredUser();
      if (!user) return;
      const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
      const initials = name
        ? name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('')
        : '--';
      if (profileAvatar) profileAvatar.textContent = initials;
      if (profileName) profileName.textContent = name;
      if (profileEmail) profileEmail.textContent = user.email;
    }

    function toggleDropdown(forceState) {
      if (!profileDropdown || !profileBtn) return;
      const isOpen = profileDropdown.style.display === 'block';
      const next = forceState !== undefined ? forceState : !isOpen;
      profileDropdown.style.display = next ? 'block' : 'none';
    }

    async function logoutUser() {
      const user = getStoredUser();
      const userId = user?.id; // Usar .id según tu imagen
      try {
        if (userId) await fetch(`${API_AUTH}/logout/${userId}`, { method: 'POST' });
      } catch (e) {} finally {
        clearSession();
        window.location.href = '../../access-control-I/login.html';
      }
    }

    if (profileBtn) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown();
      });
    }

    document.addEventListener('click', (e) => {
      if (profileDropdown && !profileDropdown.contains(e.target) && !profileBtn.contains(e.target)) {
        toggleDropdown(false);
      }
    });

    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logoutUser();
      });
    }

    setProfileUI();
});