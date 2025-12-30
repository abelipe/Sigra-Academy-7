// ==========================================
// LÓGICA PRINCIPAL CON API
// ==========================================

const viewContainer = document.getElementById('view-container');
const API_BASE = 'http://localhost:4300/api/subjects'; // Cambiar si es necesario

let materias = []; // Array global para las materias
let currentPage = 1;
const itemsPerPage = 5;
let filteredMaterias = [];

function showView(view, id = null) {
    if (view === 'catalogo') {
        loadSubjects().then(() => {
            filteredMaterias = [...materias];
            currentPage = 1;
            renderCatalogo();
        });
    }
    if (view === 'crear') renderForm(null);
    if (view === 'editar') renderForm(materias.find(m => m.id == id));
}

// Función para cargar materias desde la API
async function loadSubjects() {
    try {
        const response = await fetch(`${API_BASE}/all`);
        const data = await response.json();
        if (data.subjects) {
            materias = data.subjects.map(m => ({
                id: m.subject_id,
                codigo: m.code_subject,
                nombre: m.subject_name,
                descripcion: m.description,
                anio: m.anio,
                is_active: m.is_active
            }));
            console.log('Materias cargadas:', materias);
        } else {
            console.error('Error al cargar materias:', data.error);
            materias = [];
        }
    } catch (error) {
        console.error('Error de red:', error);
        materias = [];
    }
}

// ------------------------------------------
// VISTA: CATÁLOGO
// ------------------------------------------
function renderCatalogo() {
    const totalPages = Math.ceil(filteredMaterias.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredMaterias.slice(startIndex, endIndex);

    const paginationButtons = [];
    for (let i = 1; i <= totalPages; i++) {
        paginationButtons.push(`<button onclick="changePage(${i})" class="${i === currentPage ? 'active' : ''}">${i}</button>`);
    }

    viewContainer.innerHTML = `
        <div class="module-header">
            <div>
                <h1>Catálogo de Materias</h1>
                <p>Consulte y gestione el listado completo de asignaturas académicas activas.</p>
            </div>
            <button class="btn-primary" onclick="showView('crear')"><i class='bx bx-plus'></i> Nueva Asignatura</button>
        </div>

        <div class="filter-card">
            <div class="filter-group">
                <label>Buscar</label>
                <div class="input-search-wrapper">
                    <i class='bx bx-search'></i>
                    <input type="text" id="q-search" placeholder="Buscar por nombre, código o ID..." onkeyup="if(event.key==='Enter') doSearch()">
                </div>
            </div>

            <div class="filter-group" style="flex: 0 0 200px;">
                <label>Filtrar por Año</label>
                <select id="f-filter-anio" onchange="doSearch()" style="padding:11px; border-radius:8px; border:1px solid var(--border); width:100%; outline:none;">
                    <option value="">Todos los años</option>
                    <option value="1° año">1° año</option>
                    <option value="2° año">2° año</option>
                    <option value="3° año">3° año</option>
                    <option value="4° año">4° año</option>
                    <option value="5° año">5° año</option>
                </select>
            </div>

            <button class="btn-reset" onclick="resetSearch()"><i class='bx bx-refresh'></i> Resetear</button>
            <button class="btn-primary" onclick="doSearch()"><i class='bx bx-search-alt'></i> Buscar</button>
        </div>

        <div class="table-card">
            <table>
                <thead>
                    <tr>
                        <th>ID</th><th>CÓDIGO</th><th>NOMBRE</th><th>DESCRIPCIÓN</th>
                        <th>AÑO</th><th>ESTADO</th><th>ACCIONES</th>
                    </tr>
                </thead>
                <tbody id="table-body">${renderRows(currentItems)}</tbody>
            </table>
        </div>

        ${totalPages > 1 ? `
        <div class="pagination">
            <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Anterior</button>
            ${paginationButtons.join('')}
            <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Siguiente</button>
        </div>
        ` : ''}
    `;
}

// ------------------------------------------
// PAGINACIÓN
// ------------------------------------------
function changePage(page) {
    const totalPages = Math.ceil(filteredMaterias.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderCatalogo();
}
function renderRows(data) {
    if (data.length === 0) return `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">No se encontraron materias.</td></tr>`;
    
    return data.map(m => `
        <tr>
            <td style="color:#94a3b8">${m.id}</td>
            <td><span class="badge-code">${m.codigo}</span></td>
            <td><strong>${m.nombre}</strong></td>
            <td style="color:var(--text-muted); max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${m.descripcion}</td>
            <td><strong>${m.anio}</strong></td>
            <td><span class="badge ${m.is_active == 1 ? 'active' : 'inactive'}">${m.is_active == 1 ? 'Activo' : 'Inactivo'}</span></td>
            <td>
                <button onclick="showView('editar', '${m.id}')" class="btn-icon edit"><i class='bx bx-edit-alt'></i></button>
                <button onclick="openDelete('${m.id}')" class="btn-icon delete"><i class='bx bx-trash'></i></button>
            </td>
        </tr>
    `).join('');
}

// ------------------------------------------
// BÚSQUEDA Y FILTRO
// ------------------------------------------
function doSearch() {
    const q = document.getElementById('q-search').value.toLowerCase();
    const filterAnio = document.getElementById('f-filter-anio').value;

    filteredMaterias = materias.filter(m => {
        const matchesSearch = m.nombre.toLowerCase().includes(q) || 
                              m.codigo.toLowerCase().includes(q) || 
                              m.id.toString().includes(q);
        const matchesAnio = filterAnio === "" || m.anio === filterAnio;
        
        return matchesSearch && matchesAnio;
    });

    currentPage = 1;
    renderCatalogo();
}

function resetSearch() {
    document.getElementById('q-search').value = "";
    document.getElementById('f-filter-anio').value = "";
    filteredMaterias = [...materias];
    currentPage = 1;
    renderCatalogo();
}

// ------------------------------------------
// FORMULARIO: CREAR / EDITAR
// ------------------------------------------
function renderForm(m) {
    const isEdit = !!m;
    viewContainer.innerHTML = `
        <div style="margin-bottom:20px; font-size:13px; color:var(--text-muted);">
            Inicio / Gestión de Materias / <span style="color:var(--primary); font-weight:700;">${isEdit ? 'Editar' : 'Crear Nueva'}</span>
        </div>
        <h1 style="margin-bottom:30px;">${isEdit ? 'Editar Asignatura' : 'Crear Nueva Asignatura'}</h1>
        
        <div class="table-card" style="padding:40px; position:relative;">
            <div style="position:absolute; top:0; left:0; width:100%; height:4px; background:var(--primary);"></div>
            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:25px;">
                <div class="filter-group" style="grid-column: span 3;">
                    <label>Nombre de la Materia *</label>
                    <div class="input-search-wrapper"><i class='bx bx-book'></i><input id="f-nombre" type="text" value="${isEdit ? m.nombre : ''}"></div>
                </div>
                <div class="filter-group">
                    <label>Código Identificador *</label>
                    <div class="input-search-wrapper"><i class='bx bx-hash'></i><input id="f-codigo" type="text" value="${isEdit ? m.codigo : ''}"></div>
                </div>
                <div class="filter-group">
                    <label>Estado del Curso</label>
                    <select id="f-estado" style="padding:11px; border-radius:8px; border:1px solid var(--border);">
                        <option value="Activo" ${isEdit && m.is_active == 1 ?'selected':''}>Activo</option>
                        <option value="Inactivo" ${isEdit && m.is_active == 0 ?'selected':''}>Inactivo</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Año *</label>
                    <select id="f-anio" style="padding:11px; border-radius:8px; border:1px solid var(--border);">
                        <option value="">Seleccionar Año</option>
                        <option value="1° año" ${isEdit && m.anio === '1° año' ?'selected':''}>1° año</option>
                        <option value="2° año" ${isEdit && m.anio === '2° año' ?'selected':''}>2° año</option>
                        <option value="3° año" ${isEdit && m.anio === '3° año' ?'selected':''}>3° año</option>
                        <option value="4° año" ${isEdit && m.anio === '4° año' ?'selected':''}>4° año</option>
                        <option value="5° año" ${isEdit && m.anio === '5° año' ?'selected':''}>5° año</option>
                    </select>
                </div>
                <div class="filter-group" style="grid-column: span 3;">
                    <label>Descripción / Síntesis</label>
                    <textarea id="f-desc" rows="4" style="padding:15px; border-radius:8px; border:1px solid var(--border);">${isEdit ? m.descripcion : ''}</textarea>
                </div>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:15px; margin-top:30px;">
                <button class="btn-cancel" onclick="showView('catalogo')">Cancelar</button>
                <button class="btn-save" onclick="saveData('${isEdit ? m.id : ''}')">${isEdit ? 'Guardar Cambios' : 'Crear Asignatura'}</button>
            </div>
        </div>
    `;
}

// ------------------------------------------
// GUARDAR DATOS (CREAR / EDITAR)
// ------------------------------------------
async function saveData(id) {
    const anio = document.getElementById('f-anio').value.replace(/[^\d]/g, '');
    if (!anio) {
        alert("Por favor, seleccione el Año.");
        return;
    }

    const data = {
        anio: anio,
        codigo: document.getElementById('f-codigo').value,
        nombre: document.getElementById('f-nombre').value,
        descripcion: document.getElementById('f-desc').value,
        is_active: document.getElementById('f-estado').value === 'Activo' ? 1 : 0
    };

    try {
        let response;
        if (id) {
            // Editar
            console.log('Enviando data para editar:', data);
            response = await fetch(`${API_BASE}/update/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            // Crear
            response = await fetch(`${API_BASE}/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }

        const result = await response.json();
        console.log('Respuesta del servidor:', result);
        if (response.ok) {
            alert(result.message);
            showView('catalogo');
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

// ------------------------------------------
// BORRAR
// ------------------------------------------
let idDel = null;
function openDelete(id) { idDel = id; document.getElementById('delete-modal').style.display = 'flex'; }
function closeDel() { document.getElementById('delete-modal').style.display = 'none'; }

async function confirmDel() {
    try {
        const response = await fetch(`${API_BASE}/delete/${idDel}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            closeDel();
            showView('catalogo');
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

// Al cargar la página, mostrar el catálogo
window.onload = () => showView('catalogo');