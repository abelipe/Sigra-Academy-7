document.addEventListener('DOMContentLoaded', () => {
    const navHtml = `
    <div class="nav-container">
      <div class="nav-left">
        <img src="/frontend/Public/resources/Modulo-1/logo.png" alt="Colegio" class="logo">
        <span class="brand">SIGRA</span></div>
      <div class="nav-menu">
        <a class="nav-link" href="../../landing/index.html">Inicio</a>
        <a class="nav-link" href="manager.view.html">Mis Cursos</a>
        <a class="nav-link" href="schedule.html">Mi Horario</a>
        <a class="nav-link" href="#">Calendario</a>
      </div>
      <div class="nav-right"><div class="user-icon"></div></div>
    </div>`;
    document.querySelectorAll('nav.navbar').forEach(nav => nav.innerHTML = navHtml);

    // marcar pestaña activa (map alias course-detail → Mis Cursos)
    const current = window.location.pathname.split('/').pop();
    const alias = { 'course-detail.html': 'manager.view.html' };
    const expected = alias[current] || current;
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href') || '';
        const page = href.split('/').pop();
        if (page === expected) link.classList.add('active');
    });
});