document.addEventListener('DOMContentLoaded', function() {
    // La referencia donde se van a inyectar los campos
    const contenedorDinamico = document.getElementById('dynamic-fields-container');

    if (!contenedorDinamico) return;

    // Solo se mostrará la selección de rol.
    // Nota: SVGs tomados de Heroicons (https://heroicons.com/)
    const htmlEstructura = `
        <div class="input-group">
            <label class="input-label" for="rolSelect">Rol Académico</label>
            <div class="input-control">
                <span class="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"/><path d="M20 21c0-3.5-3.5-6-8-6s-8 2.5-8 6" stroke-linecap="round"/></svg>
                </span>
                <select id="rolSelect" required style="width: 100%; border: none; outline: none; background: transparent; padding: 10px; color: #333;">
                    <option value="">-- Seleccionar --</option>
                    <option value="estudiante">Estudiante</option>
                    <option value="profesor">Profesor</option>
                </select>
            </div>
        </div>
    `;

    // Inyectar HTML
    contenedorDinamico.innerHTML = htmlEstructura;

    // Referencia al select de rol (usado por el handler de envío)
    const rolSelect = document.getElementById('rolSelect');

    // Handler para crear usuario al presionar "Aceptar"
    const btnAceptar = document.getElementById('btnAceptar');
    if (btnAceptar) {
        btnAceptar.addEventListener('click', async () => {
            const firstName = document.getElementById('names')?.value?.trim();
            const lastName = document.getElementById('lastnames')?.value?.trim();
            const email = document.getElementById('email')?.value?.trim();
            const phone = document.getElementById('phone')?.value?.trim();
            const password = document.getElementById('password')?.value || '';
            const confirmPassword = document.getElementById('confirm-password')?.value || '';
            const rol = document.getElementById('rolSelect')?.value || '';

            // Validaciones mínimas
            if (!firstName || !lastName || !email || !phone || !password || !rol) {
                alert('Por favor completa todos los campos requeridos.');
                return;
            }
            if (password !== confirmPassword) {
                alert('Las contraseñas no coinciden.');
                return;
            }

            // Mapear rol a ID: profesor=2, estudiante=3
            const roleMap = { profesor: 2, estudiante: 3 };
            const role_id = roleMap[rol];
            if (!role_id) {
                alert('Selecciona un rol válido.');
                return;
            }

            const payload = {
                role_id,
                first_name: firstName,
                last_name: lastName,
                email,
                phone,
                password_hash: password
            };

            const API_BASE = 'http://localhost:3000/api';
            try {
                const res = await fetch(`${API_BASE}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();
                if (!res.ok) {
                    // Mostrar detalles si la validación Zod falló
                    let msg = data?.error || 'Error al crear el usuario';
                    const issues = data?.details?.issues || data?.details?.error?.issues;
                    if (Array.isArray(issues) && issues.length) {
                        const detailsText = issues.map(i => `${(i.path||[]).join('.')}: ${i.message}`).join('\n');
                        msg += `\n\nDetalles:\n${detailsText}`;
                    }
                    alert(msg);
                    return;
                }

                alert('Usuario creado correctamente');
                // Redirigir a la tabla de usuarios
                window.location.href = 'user-table.html';
            } catch (err) {
                alert('Error de red: ' + (err?.message || 'intenta nuevamente'));
            }
        });
    }
});