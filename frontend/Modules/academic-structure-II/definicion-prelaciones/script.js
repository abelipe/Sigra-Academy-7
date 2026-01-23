document.addEventListener('DOMContentLoaded', () => {

    const closeBtn = document.querySelector('.close-btn');
    const selectedItem = document.querySelector('.selected-item');
    const addBtn = document.querySelector('.btn-primary-dark');
    const prereqList = document.getElementById('prereq-list');
    const saveBtn = document.querySelector('.btn-primary');
    const tableBody = document.querySelector('.data-table tbody');

    const deleteModal = document.getElementById('delete-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const cancelDeleteBtn = document.getElementById('cancel-delete');

    // Elementos para la búsqueda de materias
    const materiaSearch = document.getElementById('materia-search');
    const selectedMateriaContainer = document.getElementById('selected-materia-container');
    const selectedMateriaTitle = document.getElementById('selected-materia-title');
    const selectedMateriaYear = document.getElementById('selected-materia-year');
    const clearMateriaBtn = document.getElementById('clear-materia-btn');
    const prereqSelect = document.getElementById('prereq-select');
    const addPrereqBtn = document.getElementById('add-prereq-btn');
    const messageBox = document.getElementById('prereq-message');

    function showMessage(text, type = 'info', timeout = 4000) {
        if (!messageBox) {
            // fallback to console.log when inline message box is not present
            console.log(text);
            return;
        }
        messageBox.textContent = text;
        messageBox.className = `inline-message ${type}`;
        messageBox.style.display = 'inline-block';
        if (timeout > 0) {
            clearTimeout(messageBox._hideTimeout);
            messageBox._hideTimeout = setTimeout(() => {
                messageBox.style.display = 'none';
            }, timeout);
        }
    }

    // Handle edit/delete actions from the summary table (event delegation)
    const summaryBody = document.getElementById('summary-body');
    if (summaryBody) {
        summaryBody.addEventListener('click', async (e) => {
            const editBtn = e.target.closest('.summary-edit');
            const delBtn = e.target.closest('.summary-delete');
            if (editBtn) {
                const subjectId = Number(editBtn.dataset.subjectId);
                if (!subjectId) return;
                // Load the subject into the main config area for editing
                try {
                    const res = await fetch(`${API_BASE}/api/prelacies/${subjectId}/prerequisites`);
                    if (!res.ok) return;
                    const data = await res.json();
                    const materia = data.subject;
                    if (!materia) return;
                    // Set selected materia UI
                    selectedMateriaTitle.textContent = `${materia.code} — ${materia.name}`;
                    selectedMateriaYear.textContent = materia.grade_name || '';
                    selectedMateriaContainer.style.display = 'flex';
                    selectedMateriaContainer.style.opacity = '1';
                    materiaPrincipalSeleccionada = materia;
                    // Fill prereq select and current prereq list
                    await llenarSelectPrerrequisitos(materia);
                    prereqList.innerHTML = '';
                    (data.prereqs || []).forEach(p => {
                        const newItem = document.createElement('div');
                        newItem.classList.add('prereq-item');
                        newItem.dataset.id = p.subject_prerequisites_id; // subject id
                        newItem.dataset.rowId = p.id; // row id in subject_prerequisites
                        newItem.innerHTML = `
                            <div class="prereq-code">${p.code}</div>
                            <div class="prereq-details">
                                <strong>${p.name}</strong>
                                <span>${p.grade_name}</span>
                            </div>
                            <button class="delete-prereq-btn"><i class="fa-solid fa-trash-can"></i></button>
                        `;
                        prereqList.appendChild(newItem);
                    });
                    // Scroll to the Configurar Requisitos section and focus the search
                    const configSection = document.querySelector('.config-section');
                    if (configSection && typeof configSection.scrollIntoView === 'function') {
                        configSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                    if (materiaSearch && typeof materiaSearch.focus === 'function') {
                        materiaSearch.focus();
                    }
                } catch (err) { console.error(err) }
            }

            if (delBtn) {
                const subjectId = Number(delBtn.dataset.subjectId);
                if (!subjectId) return;
                // Open the custom confirmation modal and store the subject id for deletion
                pendingSubjectDelete = subjectId;
                if (deleteModal) deleteModal.classList.add('active');
                return;
            }
        });
    }

    // Elementos para el modal de prelaciones recientes
    const viewAllBtn = document.getElementById('view-all-prelaciones');
    const prelacionesModal = document.getElementById('prelaciones-modal');
    const closePrelacionesModal = document.getElementById('close-prelaciones-modal');
    const prelacionesList = document.getElementById('prelaciones-list');

    // Botón Cancelar de la configuración
    const cancelConfigBtn = document.getElementById('cancel-config-btn');

    let filaAEliminar = null;
    let materiaPrincipalSeleccionada = null;
    let pendingSubjectDelete = null;

    // Determine API base URL. We'll probe the current origin to see if it serves the API;
    // otherwise fall back to the backend at localhost:3000. You can override by setting
    // `window.API_BASE = 'http://localhost:3000'` in the browser console before reload.
    let API_BASE = window.API_BASE || 'http://localhost:3000';

    async function resolveApiBase() {
        const origin = window.location && window.location.origin ? window.location.origin : null;
        if (!origin || origin === 'null' || window.location.protocol === 'file:') return API_BASE;

        // probe origin/api/prelacies with short timeout
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 1000);
            const res = await fetch(`${origin}/api/prelacies`, { method: 'GET', signal: controller.signal });
            clearTimeout(timeout);
            if (res.ok) return origin;
        } catch (err) {
            // ignore - fallback below
        }
        return API_BASE;
    }

    // We'll load materias and possible prerequisites from the backend

    // Search subjects via backend
    async function buscarMateria(texto) {
        const raw = String(texto || '').trim();
        if (!raw) return null;
        // If the value comes from the datalist it may be "CODE — Name".
        // Extract the code portion before searching to increase match accuracy.
        let q = raw;
        if (raw.indexOf('—') !== -1) {
            q = raw.split('—')[0].trim();
        } else if (raw.indexOf('-') !== -1) {
            const parts = raw.split('-');
            if (parts.length > 1 && parts[0].trim().match(/[A-Za-z]{1,}\d*/)) {
                q = parts[0].trim() + '-' + parts[1].trim();
            }
        }
        try {
            const res = await fetch(`${API_BASE}/api/prelacies/search?q=${encodeURIComponent(q)}`);
            if (!res.ok) return null;
            const rows = await res.json();
            return rows && rows.length ? rows[0] : null;
        } catch (err) {
            console.error('Search error', err);
            return null;
        }
    }

    // Fill prereq select with subjects from backend (exclude 5th year)
    // If materiaPrincipal provided, request possible prerrequisitos for that subject
    async function llenarSelectPrerrequisitos(materiaPrincipal = null) {
        prereqSelect.innerHTML = '<option>Seleccione una asignatura...</option>';
        addPrereqBtn.disabled = true;
        try {
            if (materiaPrincipal && materiaPrincipal.subject_id) {
                // request possible prerequisites for this subject
                const res = await fetch(`${API_BASE}/api/prelacies/${materiaPrincipal.subject_id}/prerequisites`);
                if (!res.ok) return;
                const data = await res.json();
                const rows = data.possible || [];
                // If none available (e.g., subject is 1st year) disable add button
                if (!rows.length) {
                    const option = document.createElement('option');
                    option.textContent = 'No hay prerrequisitos disponibles';
                    option.disabled = true;
                    prereqSelect.appendChild(option);
                    addPrereqBtn.disabled = true;
                    return;
                }
                rows.forEach(materia => {
                    if (!materiaPrincipal || materia.subject_id !== materiaPrincipal.subject_id) {
                        const option = document.createElement('option');
                        option.value = materia.subject_id; // store id
                        option.textContent = `${materia.code} — ${materia.name}`;
                        option.dataset.year = materia.grade_name;
                        prereqSelect.appendChild(option);
                    }
                });
                addPrereqBtn.disabled = false;
            } else {
                const res = await fetch(`${API_BASE}/api/prelacies`);
                if (!res.ok) return;
                const rows = await res.json();
                rows.forEach(materia => {
                    const option = document.createElement('option');
                    option.value = materia.subject_id; // store id
                    option.textContent = `${materia.code} — ${materia.name}`;
                    option.dataset.year = materia.grade_name;
                    prereqSelect.appendChild(option);
                });
                addPrereqBtn.disabled = false;
            }
        } catch (err) {
            console.error('Error loading subjects', err);
            addPrereqBtn.disabled = true;
        }
    }

    // Cargar prelaciones modal (intentionally simple: will show no static examples)
    function cargarPrelacionesModal() {
        // Load all prelaciones and render grouped by subject
        prelacionesList.innerHTML = '';
        fetch(`${API_BASE}/api/prelacies/all`)
            .then(r => r.ok ? r.json() : Promise.reject(r))
            .then(rows => {
                if (!rows || !rows.length) {
                    prelacionesList.innerHTML = '<div class="prelacion-modal-item">No hay prelaciones registradas.</div>';
                    return;
                }
                // group by subject_id
                const map = new Map();
                rows.forEach(r => {
                    const sid = r.subject_id;
                    if (!map.has(sid)) map.set(sid, { subject_code: r.subject_code, subject_name: r.subject_name, created_at: r.created_at, prereqs: [], hasNoPrereqs: false });
                    const entry = map.get(sid);
                    if (r.prereq_code == null) {
                        entry.hasNoPrereqs = true;
                    } else {
                        entry.prereqs.push({ code: r.prereq_code, name: r.prereq_name });
                    }
                    if (!entry.created_at || new Date(r.created_at) > new Date(entry.created_at)) entry.created_at = r.created_at;
                });
                // render
                Array.from(map.values()).forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'prelacion-modal-item';
                    const requisitosHTML = (item.prereqs && item.prereqs.length && !item.hasNoPrereqs) ? `<div class="prelacion-requisitos">${item.prereqs.map(p => `<span class="requisito-badge"><i class="fa-solid fa-arrow-right"></i> ${p.code} ${p.name}</span>`).join('')}</div>` : `<div class="prelacion-requisitos"><span class="sin-prelaciones-badge"><i class="fa-solid fa-circle-check"></i> Sin prelaciones</span></div>`;
                    div.innerHTML = `
                        <div class="prelacion-header">
                            <span class="prelacion-codigo">${item.subject_code}</span>
                            <span class="prelacion-fecha">${item.created_at ? new Date(item.created_at).toLocaleString() : ''}</span>
                        </div>
                        <div class="prelacion-title">${item.subject_name}</div>
                        ${requisitosHTML}
                    `;
                    prelacionesList.appendChild(div);
                });
            })
            .catch(err => {
                console.error('Error loading prelaciones', err);
                prelacionesList.innerHTML = '<div class="prelacion-modal-item">Error al cargar prelaciones.</div>';
            });
    }

    // Store all subjects for autocomplete
    let allSubjects = [];
    const autocompleteDropdown = document.getElementById('autocomplete-dropdown');
    const autocompleteResults = document.getElementById('autocomplete-results');

    // Load subjects for autocomplete
    async function loadSubjectsForAutocomplete() {
        try {
            // Include 5th year subjects for the primary selection
            const res = await fetch(`${API_BASE}/api/prelacies?includeFifth=true`);
            if (!res.ok) return;
            allSubjects = await res.json();
        } catch (err) { console.error(err) }
    }

    // Render autocomplete results
    function renderAutocompleteResults(subjects) {
        if (!autocompleteResults) return;

        if (!subjects || subjects.length === 0) {
            autocompleteResults.innerHTML = `
                <div class="autocomplete-empty">
                    <i class="fa-solid fa-search"></i>
                    No se encontraron materias
                </div>
            `;
            return;
        }

        autocompleteResults.innerHTML = subjects.map(s => `
            <div class="autocomplete-item" data-subject-id="${s.subject_id}" data-code="${s.code}" data-name="${s.name}" data-grade="${s.grade_name}" data-level="${s.level_order}">
                <div class="autocomplete-item-code">${s.code}</div>
                <div class="autocomplete-item-info">
                    <span class="autocomplete-item-name">${s.name}</span>
                    <span class="autocomplete-item-year"><i class="fa-solid fa-graduation-cap"></i> ${s.grade_name}</span>
                </div>
                <i class="fa-solid fa-chevron-right autocomplete-item-arrow"></i>
            </div>
        `).join('');
    }

    // Filter subjects based on search query
    function filterSubjects(query) {
        if (!query || query.trim() === '') {
            return allSubjects.slice(0, 10); // Show first 10 if no query
        }
        const q = query.toLowerCase().trim();
        return allSubjects.filter(s =>
            s.code.toLowerCase().includes(q) ||
            s.name.toLowerCase().includes(q)
        ).slice(0, 15); // Limit to 15 results
    }

    // Show/hide autocomplete dropdown
    function showAutocomplete() {
        if (autocompleteDropdown) {
            autocompleteDropdown.classList.add('active');
        }
    }

    function hideAutocomplete() {
        if (autocompleteDropdown) {
            autocompleteDropdown.classList.remove('active');
        }
    }

    // Load recent prelaciones (for the aside widget)
    async function loadAllPrelacies() {
        try {
            const res = await fetch(`${API_BASE}/api/prelacies/all`);
            if (!res.ok) return;
            const rows = await res.json();
            const container = document.getElementById('recent-prelaciones');
            container.innerHTML = '';
            if (!rows.length) {
                container.innerHTML = '<div class="activity-item"><p class="text-gray">No hay prelaciones registradas.</p></div>';
                return;
            }
            // group by subject and pick latest created_at
            const map = new Map();
            rows.forEach(r => {
                const sid = r.subject_id;
                if (!map.has(sid)) map.set(sid, { subject_code: r.subject_code, subject_name: r.subject_name, created_at: r.created_at, prereqs: [], hasNoPrereqs: false });
                const entry = map.get(sid);
                if (r.prereq_code == null) {
                    entry.hasNoPrereqs = true;
                } else {
                    entry.prereqs.push(`${r.prereq_code} ${r.prereq_name}`);
                }
                if (!entry.created_at || new Date(r.created_at) > new Date(entry.created_at)) entry.created_at = r.created_at;
            });
            // sort by created_at desc
            const items = Array.from(map.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            // Only show the two most recent prelaciones in the aside widget; "Ver todas" opens the full modal
            items.slice(0, 2).forEach(it => {
                const div = document.createElement('div');
                div.className = 'activity-item';
                const time = it.created_at ? new Date(it.created_at).toLocaleString() : '';
                const prereqText = (it.prereqs.length && !it.hasNoPrereqs) ? it.prereqs.join(', ') : 'Sin prelaciones';
                div.innerHTML = `
                    <div class="act-header"><span class="badge-gray">${it.subject_code}</span><span class="time">${time}</span></div>
                    <h5>${it.subject_name}</h5>
                    <p class="arrow-text"><i class="fa-solid fa-arrow-right"></i> Requiere: ${prereqText}</p>
                `;
                container.appendChild(div);
            });
        } catch (err) { console.error(err) }
    }

    // Load summary table (subjects that have prereqs)
    // Pagination state for summary (carousel of pages showing 2 items each)
    let summaryRows = [];
    let summaryPage = 0;
    const SUMMARY_PAGE_SIZE = 2;

    function renderSummaryPage() {
        const tbody = document.getElementById('summary-body');
        const rangeText = document.getElementById('summary-range');
        const prevBtn = document.getElementById('summary-prev');
        const nextBtn = document.getElementById('summary-next');
        tbody.innerHTML = '';
        if (!summaryRows || !summaryRows.length) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-gray">No hay prelaciones registradas.</td></tr>';
            if (rangeText) rangeText.textContent = 'Mostrando 0 a 0 de 0 resultados';
            if (prevBtn) prevBtn.disabled = true;
            if (nextBtn) nextBtn.disabled = true;
            return;
        }
        const total = summaryRows.length;
        const start = summaryPage * SUMMARY_PAGE_SIZE;
        const end = Math.min(start + SUMMARY_PAGE_SIZE, total);
        const pageItems = summaryRows.slice(start, end);

        pageItems.forEach(r => {
            const tr = document.createElement('tr');
            let prereqContent = '';
            if (r.hasNoPrereqs) {
                prereqContent = `<span class="badge-green">Sin prelaciones</span>`;
            } else if (r.prereqs && r.prereqs.length) {
                prereqContent = r.prereqs.map(p => `<span class="badge-blue">${p.code} ${p.name}</span>`).join(' ');
            } else {
                prereqContent = '<span class="text-gray">-</span>';
            }
            tr.setAttribute('data-subject-id', r.subject_id || r.subjectId || r.id);
            tr.innerHTML = `
                <td class="code-col">${r.subject_code}</td>
                <td><strong>${r.subject_name}</strong></td>
                <td>${prereqContent}</td>
                <td class="actions">
                    <button class="icon-btn summary-edit" data-subject-id="${r.subject_id}"><i class="fa-solid fa-pencil"></i></button>
                    <button class="icon-btn summary-delete" data-subject-id="${r.subject_id}"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Update range text and buttons
        if (rangeText) rangeText.textContent = `Mostrando ${start + 1} a ${end} de ${total} resultados`;
        if (prevBtn) prevBtn.disabled = summaryPage <= 0;
        if (nextBtn) nextBtn.disabled = end >= total;
    }

    async function loadSummary() {
        try {
            const res = await fetch(`${API_BASE}/api/prelacies/summary`);
            if (!res.ok) return;
            const rows = await res.json();
            summaryRows = rows || [];
            summaryPage = 0;
            renderSummaryPage();
        } catch (err) { console.error(err) }
    }

    // Inicializar el select de prerrequisitos y otros datos dinámicos
    (async () => {
        API_BASE = await resolveApiBase();
        await llenarSelectPrerrequisitos();
        await loadSubjectsForAutocomplete();
        await loadAllPrelacies();
        await loadSummary();

        // Wire pagination buttons
        const prevBtn = document.getElementById('summary-prev');
        const nextBtn = document.getElementById('summary-next');
        if (prevBtn) prevBtn.addEventListener('click', (e) => {
            if (summaryPage > 0) {
                summaryPage -= 1;
                renderSummaryPage();
            }
        });
        if (nextBtn) nextBtn.addEventListener('click', (e) => {
            const maxPage = Math.ceil((summaryRows.length || 0) / SUMMARY_PAGE_SIZE) - 1;
            if (summaryPage < maxPage) {
                summaryPage += 1;
                renderSummaryPage();
            }
        });
    })();

    // --- 1. Buscar y Seleccionar Materia Principal ---
    if (materiaSearch) {
        // Handler to select a subject from autocomplete
        const selectSubject = async function (materia) {
            if (!materia) return;

            // Actualizar la información mostrada
            selectedMateriaTitle.textContent = `${materia.code} — ${materia.name}`;
            selectedMateriaYear.textContent = materia.grade_name || '';

            // Mostrar el contenedor
            selectedMateriaContainer.style.display = 'flex';
            selectedMateriaContainer.style.opacity = '1';

            // Guardar la materia seleccionada
            materiaPrincipalSeleccionada = materia;

            // Actualizar el select de prerrequisitos desde backend (excluyendo la materia principal)
            await llenarSelectPrerrequisitos(materia);

            // Load existing prerequisites for this subject
            try {
                const res = await fetch(`${API_BASE}/api/prelacies/${materia.subject_id}/prerequisites`);
                if (res.ok) {
                    const data = await res.json();
                    // render existing prerequisites
                    prereqList.innerHTML = '';
                    data.prereqs.forEach(p => {
                        const newItem = document.createElement('div');
                        newItem.classList.add('prereq-item');
                        newItem.dataset.id = p.subject_prerequisites_id;
                        newItem.dataset.rowId = p.id;
                        newItem.innerHTML = `
                            <div class="prereq-code">${p.code}</div>
                            <div class="prereq-details">
                                <strong>${p.name}</strong>
                                <span>${p.grade_name}</span>
                            </div>
                            <button class="delete-prereq-btn"><i class="fa-solid fa-trash-can"></i></button>
                        `;
                        prereqList.appendChild(newItem);
                    });
                }
            } catch (err) { console.error(err) }

            // Limpiar el campo de búsqueda y cerrar dropdown
            materiaSearch.value = '';
            hideAutocomplete();
        };

        // Input event - filter subjects as user types
        materiaSearch.addEventListener('input', function () {
            const query = this.value.trim();
            const filtered = filterSubjects(query);
            renderAutocompleteResults(filtered);
            if (query.length > 0 || document.activeElement === materiaSearch) {
                showAutocomplete();
            }
        });

        // Focus event - show dropdown
        materiaSearch.addEventListener('focus', function () {
            const filtered = filterSubjects(this.value.trim());
            renderAutocompleteResults(filtered);
            showAutocomplete();
        });

        // Click on autocomplete item
        if (autocompleteResults) {
            autocompleteResults.addEventListener('click', function (e) {
                const item = e.target.closest('.autocomplete-item');
                if (item) {
                    const materia = {
                        subject_id: parseInt(item.dataset.subjectId),
                        code: item.dataset.code,
                        name: item.dataset.name,
                        grade_name: item.dataset.grade,
                        level_order: parseInt(item.dataset.level)
                    };
                    selectSubject(materia);
                }
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.autocomplete-wrapper')) {
                hideAutocomplete();
            }
        });

        // Keyboard navigation
        materiaSearch.addEventListener('keydown', async function (e) {
            if (e.key === 'Escape') {
                hideAutocomplete();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const firstItem = autocompleteResults?.querySelector('.autocomplete-item');
                if (firstItem) {
                    const materia = {
                        subject_id: parseInt(firstItem.dataset.subjectId),
                        code: firstItem.dataset.code,
                        name: firstItem.dataset.name,
                        grade_name: firstItem.dataset.grade,
                        level_order: parseInt(firstItem.dataset.level)
                    };
                    await selectSubject(materia);
                }
            }
        });
    }

    // --- 2. Limpiar Materia Seleccionada ---
    if (clearMateriaBtn) {
        clearMateriaBtn.addEventListener('click', async () => {
            selectedMateriaContainer.style.opacity = '0';
            setTimeout(() => {
                selectedMateriaContainer.style.display = 'none';
            }, 300);

            materiaPrincipalSeleccionada = null;

            // Resetear el select de prerrequisitos para incluir todas las materias
            prereqList.innerHTML = '';
            await llenarSelectPrerrequisitos();
        });
    }

    // --- 3. Añadir Prerrequisito ---
    if (addPrereqBtn) {
        addPrereqBtn.addEventListener('click', () => {
            if (addPrereqBtn.disabled) return;
            const selectedOption = prereqSelect.options[prereqSelect.selectedIndex];
            if (selectedOption && selectedOption.value && selectedOption.text !== 'Seleccione una asignatura...') {
                // Prevent duplicates in the UI
                if (prereqList.querySelector(`.prereq-item[data-id="${selectedOption.value}"]`)) {
                    showMessage('La materia ya está en la lista de prerrequisitos.', 'info');
                    return;
                }
                const newItem = document.createElement('div');
                newItem.classList.add('prereq-item');
                newItem.dataset.id = selectedOption.value;
                newItem.innerHTML = `
                    <div class="prereq-code">${selectedOption.text.split('—')[0].trim()}</div>
                    <div class="prereq-details">
                        <strong>${selectedOption.text.split('—')[1].trim()}</strong>
                        <span>${selectedOption.dataset.year || ''}</span>
                    </div>
                    <button class="delete-prereq-btn"><i class="fa-solid fa-trash-can"></i></button>
                `;
                newItem.style.animation = "fadeIn 0.5s";
                prereqList.appendChild(newItem);
                prereqSelect.selectedIndex = 0;
            }
        });
    }

    // --- 4. Eliminar Prerrequisitos de la lista pequeña ---
    if (prereqList) {
        prereqList.addEventListener('click', async (e) => {
            const btn = e.target.closest('.delete-prereq-btn');
            if (btn) {
                const item = btn.closest('.prereq-item');
                const rowId = item.dataset.rowId;
                if (rowId) {
                    // Delete on server if this prereq row exists in DB
                    try {
                        const res = await fetch(`${API_BASE}/api/prelacies/${rowId}`, { method: 'DELETE' });
                        if (!res.ok) {
                            showMessage('No se pudo eliminar el prerrequisito en el servidor', 'error');
                            return;
                        }
                        // refresh summaries
                        await loadAllPrelacies();
                        await loadSummary();
                    } catch (err) {
                        console.error(err);
                        showMessage('Error de red al eliminar', 'error');
                        return;
                    }
                }
                item.style.transform = 'translateX(20px)';
                item.style.transition = 'all 0.3s ease';
                setTimeout(() => item.remove(), 300);
            }
        });
    }

    // --- 5. Eliminar de la Tabla con Modal y Efecto de Contracción ---
    const cerrarModal = () => {
        if (deleteModal) {
            deleteModal.classList.remove('active');
            filaAEliminar = null;
            pendingSubjectDelete = null;
        }
    };

    if (tableBody) {
        tableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('fa-trash-can')) {
                filaAEliminar = e.target.closest('tr');
                if (deleteModal) deleteModal.classList.add('active');
            }
        });
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async () => {
            // If a subject delete is pending (from summary trash), perform server delete
            if (pendingSubjectDelete) {
                const sid = pendingSubjectDelete;
                pendingSubjectDelete = null;
                try {
                    const res = await fetch(`${API_BASE}/api/prelacies/subject/${sid}`, { method: 'DELETE' });
                    if (!res.ok) {
                        showMessage('No se pudo eliminar la prelación.', 'error');
                        cerrarModal();
                        return;
                    }
                    showMessage('Prelaciones eliminadas.', 'success');
                    await loadAllPrelacies();
                    await loadSummary();
                } catch (err) {
                    console.error(err);
                    showMessage('Error de red al eliminar.', 'error');
                }
                cerrarModal();
                return;
            }

            if (filaAEliminar && typeof filaAEliminar.remove === 'function') {
                // Try to detect a server-side id on the row and delete remotely if present
                const rowId = filaAEliminar.dataset && (filaAEliminar.dataset.rowId || filaAEliminar.dataset.id || filaAEliminar.dataset['subjectPrerequisitesId']);
                if (rowId) {
                    try {
                        const res = await fetch(`${API_BASE}/api/prelacies/${rowId}`, { method: 'DELETE' });
                        if (!res.ok) {
                            showMessage('No se pudo eliminar en el servidor.', 'error');
                            cerrarModal();
                            return;
                        }
                        // refresh summaries after remote delete
                        await loadAllPrelacies();
                        await loadSummary();
                    } catch (err) {
                        console.error(err);
                        showMessage('Error de red al eliminar.', 'error');
                        cerrarModal();
                        return;
                    }
                }

                // Remove from DOM with animation
                filaAEliminar.classList.add('row-collapsing');
                setTimeout(() => {
                    try { filaAEliminar.remove(); } catch (e) { /* ignore */ }
                }, 300);
            }
            cerrarModal();
        });
    }

    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', cerrarModal);
    }

    if (deleteModal) {
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) cerrarModal();
        });
    }

    // --- 6. Guardar prelaciones en backend ---
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            if (!materiaPrincipalSeleccionada) {
                showMessage('Por favor, seleccione una materia principal primero.', 'error');
                return;
            }

            const subjectId = materiaPrincipalSeleccionada.subject_id || materiaPrincipalSeleccionada.subjectId || materiaPrincipalSeleccionada.id;

            const items = Array.from(prereqList.querySelectorAll('.prereq-item'));
            // If there are no prereq items, allow saving only for 1st year subjects (create NULL prereq placeholder)
            if (!items.length) {
                const level = materiaPrincipalSeleccionada.level_order || materiaPrincipalSeleccionada.levelOrder || materiaPrincipalSeleccionada.level;
                if (Number(level) === 1) {
                    // create placeholder row with NULL prerequisite
                    try {
                        const res = await fetch(`${API_BASE}/api/prelacies`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ subject_id: subjectId, prerequisite_id: null })
                        });
                        const data = await res.json();
                        if (res.ok) {
                            showMessage('Prelación (sin prerrequisitos) guardada correctamente.', 'success');
                        } else {
                            showMessage(data && data.message ? data.message : 'No se pudo guardar la prelación.', 'error');
                        }
                    } catch (err) {
                        console.error(err);
                        showMessage('Error de red al guardar.', 'error');
                    }
                    await loadAllPrelacies();
                    await loadSummary();
                    return;
                }
                showMessage('No hay prerrequisitos para guardar.', 'info');
                return;
            }

            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
            saveBtn.disabled = true;

            const results = [];
            for (const it of items) {
                // If item already has a rowId it exists in DB
                if (it.dataset.rowId) continue;
                const prereqId = it.dataset.id;
                if (!prereqId) continue;
                try {
                    const res = await fetch(`${API_BASE}/api/prelacies`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ subject_id: subjectId, prerequisite_id: Number(prereqId) })
                    });
                    const data = await res.json();
                    if (res.ok && data && data.id) {
                        it.dataset.rowId = data.id; // mark saved
                    }
                    results.push({ ok: res.ok, data });
                } catch (err) {
                    results.push({ ok: false, error: err.message });
                }
            }

            // Show simple summary
            const failures = results.filter(r => !r.ok);
            if (failures.length) {
                showMessage(`Algunas operaciones fallaron: ${failures.length}`, 'error');
            } else {
                showMessage('Prelaciones guardadas correctamente.', 'success');
            }
            // Refresh recent and summary views
            await loadAllPrelacies();
            await loadSummary();

            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        });
    }

    // --- 7. Modal de "Ver todas" las Prelaciones Recientes ---
    // Abrir modal de prelaciones
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', (e) => {
            e.preventDefault();
            cargarPrelacionesModal();
            prelacionesModal.classList.add('active');
        });
    }

    // Cerrar modal de prelaciones
    if (closePrelacionesModal) {
        closePrelacionesModal.addEventListener('click', () => {
            prelacionesModal.classList.remove('active');
        });
    }

    // Cerrar modal al hacer clic fuera del contenido
    if (prelacionesModal) {
        prelacionesModal.addEventListener('click', (e) => {
            if (e.target === prelacionesModal) {
                prelacionesModal.classList.remove('active');
            }
        });
    }

    // Cerrar modal con tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && prelacionesModal.classList.contains('active')) {
            prelacionesModal.classList.remove('active');
        }
    });

    // --- 8. Cancelar Configuración de Prelaciones ---
    if (cancelConfigBtn) {
        cancelConfigBtn.addEventListener('click', () => {
            // 1. Limpiar materia principal seleccionada
            if (selectedMateriaContainer.style.display !== 'none') {
                selectedMateriaContainer.style.opacity = '0';
                setTimeout(() => {
                    selectedMateriaContainer.style.display = 'none';
                }, 300);
            }

            // 2. Restablecer el campo de búsqueda de materia principal
            if (materiaSearch) {
                materiaSearch.value = '';
            }

            // 3. Restablecer variable de materia seleccionada
            materiaPrincipalSeleccionada = null;

            // 4. Limpiar la lista de prerrequisitos añadidos con animación
            const prereqItems = prereqList.querySelectorAll('.prereq-item');
            prereqItems.forEach(item => {
                item.style.opacity = '0';
                item.style.transform = 'translateX(20px)';
                item.style.transition = 'all 0.3s ease';
                setTimeout(() => item.remove(), 300);
            });

            // Limpiar después de las animaciones
            setTimeout(() => {
                prereqList.innerHTML = '';
            }, 350);

            // 5. Restablecer el select de prerrequisitos
            prereqSelect.selectedIndex = 0;

            // 6. Llenar el select con todas las materias nuevamente
            llenarSelectPrerrequisitos();

            // 7. Si el botón Guardar estaba en estado "Guardado", restablecerlo
            if (saveBtn) {
                saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Prelaciones';
                saveBtn.style.backgroundColor = '';
                saveBtn.disabled = false;
            }

            // 8. Mensaje de confirmación (opcional)
            console.log('Configuración cancelada. Todos los campos han sido restablecidos.');
        });
    }
});
