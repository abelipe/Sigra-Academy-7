const API_URL = 'http://localhost:3000/api/academic-manager'

// Obtener el ID del estudiante (por ahora hardcodeado, luego vendrá de la sesión)
const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
const STUDENT_ID = storedUser ? storedUser.user_id : 3;

// Mapeo de materias a imágenes
const courseImages = {
  'Matemáticas I': '../../../Public/resources/Modulo-3/mateLogo.jpg',
  'Matemáticas III': '../../../Public/resources/Modulo-3/mateLogo.jpg',
  'Ciencias Naturales I': '../../../Public/resources/Modulo-3/biologiaLogo.jpg',
  'Historia y Geografía': '../../../Public/resources/Modulo-3/castellanoLogo.jpg',
  'Ciencias Sociales': '../../../Public/resources/Modulo-3/castellanoLogo.jpg',
  'Comunicación y Lenguaje': '../../../Public/resources/Modulo-3/castellanoLogo.jpg',
  'Física': '../../../Public/resources/Modulo-3/fisicaLogo.jpg',
  'Química': '../../../Public/resources/Modulo-3/quimicaLogo.jpg',
  'Biología': '../../../Public/resources/Modulo-3/biologiaLogo.jpg'
}

// Función para cargar los cursos del estudiante
async function loadCourses() {
  try {
    const response = await fetch(`${API_URL}/courses/${STUDENT_ID}`)
    const data = await response.json()
    
    if (data.success) {
      renderCourses(data.data)
    } else {
      console.error('Error al cargar cursos:', data.message)
    }
  } catch (error) {
    console.error('Error de conexión:', error)
  }
}

// Función para renderizar los cursos en el HTML
function renderCourses(courses) {
  const container = document.querySelector('.cursosDisponibles')
  container.innerHTML = ''
  courses.forEach(course => {
    const article = document.createElement('article')
    article.className = 'cartaDeCurso'

    const imageUrl = courseImages[course.subject_name] || '../../Public/resources/Modulo-3/default-course.jpg'

    article.innerHTML = `
      <div class="infoDeCurso">
        <p class="gradoDelCurso">${course.grade_name} · Sección ${course.section_name}</p>
        <h2 class="CursoNombre">${course.subject_name}</h2>
        <p class="CursoProfesor">Profesor: <span class="prof-name">${course.teacher_name || '—'}</span></p>
        <p class="CursoPeriodo small">Periodo: ${course.academic_year || ''}</p>
      </div>
      <div class="ImagenDelCurso">
        <img class="img-rounded" src="${imageUrl}" alt="${course.subject_name}">
      </div>
    `

    article.addEventListener('click', () => viewCourseDetail(course.assignment_id))
    container.appendChild(article)
  })
}

// Función para ver detalles de un curso
async function viewCourseDetail(assignmentId) {
  try {
    const response = await fetch(`${API_URL}/courses/${assignmentId}/detail`)
    const data = await response.json()
    
    if (data.success) {
      // Redirigir a la vista de detalle pasando el assignmentId
      window.location.href = `course-detail.html?assignmentId=${assignmentId}`
    }
  } catch (error) {
    console.error('Error al cargar detalles:', error)
  }
}

// Cargar cursos al iniciar la página
document.addEventListener('DOMContentLoaded', loadCourses)

window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    // cuando el navegador restaura desde cache, recargamos los cursos frescos
    loadCourses().catch(err => console.warn('Reload courses on pageshow failed', err));
  }
});