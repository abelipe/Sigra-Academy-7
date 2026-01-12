const API_URL = 'http://localhost:3000/api/academic-manager';

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const assignmentId = params.get('assignmentId');

    if (!assignmentId) {
        document.body.innerHTML = '<h1>Error: No se especificó una materia.</h1>';
        return;
    }

    // Cargar datos iniciales
    loadCourseHeader(assignmentId);
    loadActivities(assignmentId);
    // Puedes llamar a loadPeople(assignmentId) aquí si ya lo tienes

    // Lógica para manejar las pestañas
    const tabs = document.querySelectorAll('.nav-tab');
    const panels = document.querySelectorAll('.content-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Quitar clase activa de todas las pestañas y paneles
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            // Añadir clase activa a la pestaña y panel seleccionados
            tab.classList.add('active');
            const targetPanel = document.getElementById(`tab-${tab.dataset.tab}`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
});

async function loadCourseHeader(assignmentId) {
    try {
        const response = await fetch(`${API_URL}/courses/${assignmentId}/detail`);
        const { data, success } = await response.json();
        if (success) {
            document.getElementById('course-name').textContent = data.subject_name;
            document.getElementById('course-section').textContent = `${data.grade_name} - ${data.section_name}`;
        }
    } catch (error) {
        console.error('Error al cargar la cabecera del curso:', error);
    }
}

async function loadActivities(assignmentId) {
    try {
        const response = await fetch(`${API_URL}/courses/${assignmentId}/activities`);
        const { data, success } = await response.json();
        const container = document.getElementById('classwork-container');
        
        if (!success || data.length === 0) {
            container.innerHTML = '<div class="panel-placeholder"><h2>No hay trabajos de clase publicados.</h2></div>';
            return;
        }

        container.innerHTML = ''; // Limpiar

        data.forEach(activity => {
            const activityElement = document.createElement('div');
            activityElement.className = 'activity-item';
            activityElement.innerHTML = `
                <span class="material-symbols-outlined">assignment</span>
                <div class="activity-item-content">
                    <h3>${activity.title}</h3>
                    <small>Fecha de entrega: ${new Date(activity.due_date).toLocaleDateString()}</small>
                </div>
            `;
            container.appendChild(activityElement);
        });
    } catch (error) {
        console.error('Error al cargar las actividades:', error);
        document.getElementById('classwork-container').innerHTML = '<div class="panel-placeholder"><h2>No se pudieron cargar las actividades.</h2></div>';
    }
}
