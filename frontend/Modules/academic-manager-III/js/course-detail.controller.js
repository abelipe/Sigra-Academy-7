const API_URL = 'http://localhost:5200/api/manager'; 
const storedUser = JSON.parse(localStorage.getItem('sigra_user') || 'null');
const STUDENT_ID = storedUser?.id || storedUser?.user_id;

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const assignmentId = params.get('assignmentId');

    if (!assignmentId) {
        window.location.href = 'manager.view.html';
        return;
    }

    initTabs();
    loadCourseHeader(assignmentId);
    loadActivities(assignmentId);
    loadResources(assignmentId); 
});

function initTabs() {
    const buttons = document.querySelectorAll('.tab-button');
    const panels = document.querySelectorAll('.tab-panel');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            buttons.forEach(b => b.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });
}

function getIcon(type) {
    const isPdf = type?.toLowerCase().includes('pdf');
    if (isPdf) {
        return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
    } else {
        return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`;
    }
}

// Función auxiliar para calcular tiempo relativo
function getRelativeTime(dueDate) {
    const now = new Date();
    const limit = new Date(dueDate);
    const diffTime = limit - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffTime < 0) {
        const pastDays = Math.abs(diffDays);
        return pastDays === 0 ? "Venció hoy" : `Vencido hace ${pastDays} días`;
    }
    
    if (diffDays === 0) return "Vence hoy";
    if (diffDays === 1) return "Vence mañana";
    return `Vence en ${diffDays} días`;
}

async function loadCourseHeader(assignmentId) {
    try {
        const response = await fetch(`${API_URL}/courses/${assignmentId}/detail`);
        const { data, success } = await response.json();
        if (success) {
            document.getElementById('course-name').textContent = data.subject_name;
            document.getElementById('course-code').textContent = data.academic_year || 'PERIODO ACADÉMICO';
            document.getElementById('course-teacher').innerHTML = `Profesor: <strong>${data.teacher_name}</strong>`;
            document.getElementById('course-section').textContent = `${data.grade_name} · Sección ${data.section_name}`;
        }
    } catch (error) { console.error(error); }
}

async function loadResources(assignmentId) {
    const container = document.getElementById('resources-container');
    try {
        const response = await fetch(`http://localhost:5200/api/resources/assignments/${assignmentId}/resources`);
        const result = await response.json();

        if (!response.ok || !result.resources || result.resources.length === 0) {
            container.innerHTML = '<div class="panel-placeholder"><h2>No hay materiales disponibles todavía.</h2></div>';
            return;
        }

        container.innerHTML = result.resources.map(res => {
            const rawPath = res.file_path_or_url || "";
            
            // 1. Normalizar barras invertidas de Windows a barras web /
            let cleanPath = rawPath.replace(/\\/g, '/');

            // 2. Si la ruta es absoluta (C:/Users/...), extraemos solo desde "uploads/"
            if (cleanPath.includes('uploads/')) {
                cleanPath = cleanPath.substring(cleanPath.indexOf('uploads/'));
            }

            // 3. Determinar si es PDF
            const isPdf = res.resource_type === 'PDF' || cleanPath.toLowerCase().endsWith('.pdf');
            
            // 4. Construir URL final
            const finalURL = cleanPath.startsWith('http') 
                ? cleanPath 
                : `http://localhost:5200/${cleanPath}`;

            return `
                <a href="${finalURL}" target="_blank" class="resource-item">
                    <div class="resource-icon ${isPdf ? 'pdf' : 'link'}">
                        ${getIcon(res.resource_type)}
                    </div>
                    <div class="resource-info">
                        <div class="resource-title">${res.title || 'Recurso sin título'}</div>
                        <div class="resource-meta">${res.resource_type} • Material de apoyo</div>
                    </div>
                    <div class="action-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="7" y1="17" x2="17" y2="7"></line>
                            <polyline points="7 7 17 7 17 17"></polyline>
                        </svg>
                    </div>
                </a>
            `;
        }).join('');
    } catch (error) { 
        console.error("Error cargando recursos:", error);
        container.innerHTML = '<p style="text-align:center; color:red;">Error al conectar con el servidor de recursos.</p>';
    }
}

async function loadActivities(assignmentId) {
    const container = document.getElementById('classwork-container');
    try {
        const resActivities = await fetch(`${API_URL}/courses/${assignmentId}/activities`);
        const dataActivities = await resActivities.json();

        const resSubmissions = await fetch(`http://localhost:5200/api/submissions/students/${STUDENT_ID}/submissions`);
        const dataSubmissions = await resSubmissions.json();

        if (!dataActivities.success || !dataActivities.data || dataActivities.data.length === 0) {
            container.innerHTML = '<div class="panel-placeholder"><h2>No hay actividades publicadas.</h2></div>';
            return;
        }

        const submissions = dataSubmissions.submissions || [];

        container.innerHTML = dataActivities.data.map(activity => {
            const dueDate = new Date(activity.due_date);
            const isLate = dueDate < new Date();
            
            const submission = submissions.find(s => s.activity_id === activity.activity_id);
            const isSubmitted = !!submission;

            let statusClass = 'status-pending';
            let badgeText = 'PENDIENTE';
            let badgeClass = 'pending';
            let btnText = 'Entregar tarea';
            
            // Calculamos el tiempo relativo (ej: Vence en 3 días)
            let timeMessage = getRelativeTime(activity.due_date);

            if (isSubmitted) {
                statusClass = 'status-submitted';
                badgeText = 'ENTREGADO';
                badgeClass = 'submitted';
                timeMessage = `Entregado el ${new Date(submission.submission_date).toLocaleDateString()}`;
                btnText = 'Ver entrega';
            } else if (isLate) {
                statusClass = 'status-late';
                badgeText = 'RETRASADO';
                badgeClass = 'late';
                btnText = 'Ver detalles';
            }

            return `
                <article class="activity-card ${statusClass}">
                    <div class="card-header">
                        <div>
                            <h3 class="card-title">${activity.title}</h3>
                            <span class="card-weight">${activity.weight_percentage}% Ponderación</span>
                        </div>
                        <span class="status-badge ${badgeClass}">${badgeText}</span>
                    </div>
                    <div class="card-footer">
                        <div class="time-remaining">
                            <span style="display:block; font-size: 0.75rem; opacity: 0.7;">Límite: ${dueDate.toLocaleDateString()}</span>
                            <strong>${timeMessage}</strong>
                        </div>
                        <button class="ghost-btn" onclick="window.location.href='activity-detail.html?activityId=${activity.activity_id}&assignmentId=${assignmentId}'">
                            ${btnText}
                        </button>
                    </div>
                </article>
            `;
        }).join('');
    } catch (error) { console.error(error); }
}