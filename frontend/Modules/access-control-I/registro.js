document.addEventListener('DOMContentLoaded', function() {
    // La referencia donde se van a inyectar los campos
    const contenedorDinamico = document.getElementById('dynamic-fields-container');

    if (!contenedorDinamico) return; 

    // Variables para la funcion llenarOpciones
    const grados = ["1er Grado", "2do Grado", "3er Grado", "4to Grado", "5to Grado"];
    
    const materias = [
        "Biología", "Ciencias Naturales I", "Ciencias Naturales II", 
        "Ciencias Sociales", "Comunicación y Lenguaje", "Educación Ética y Ciudadana",
        "Física Básica", "Historia y Geografía", "Lengua y Literatura",
        "Matemáticas I", "Matemáticas II", "Matemáticas III", 
        "Matemáticas IV", "Matemáticas V", "Química Básica"
    ];
    


    // La estructura que sera inyectada en el html
    // Nota: Los SVG fueron tomados de Heroicons (https://heroicons.com/)
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

        <div id="camposEstudiante" style="display: none;">
            <div class="input-group">
                <label class="input-label" for="seccionEstudiante">Sección</label>
                <div class="input-control">
                    <span class="input-icon"> 
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="7" r="4"/><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>
                    </span>
                    <select id="seccionEstudiante" style="width: 100%; border: none; outline: none; background: transparent; padding: 10px; color: #333;">
                        <option value="A">A</option>
                        <option value="B">B</option>
                    </select>
                </div>
            </div>

            <div class="input-group">
                <label class="input-label" for="gradoSelect">Grado</label>
                <div class="input-control">
                    <span class="input-icon"> 
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                    </span>
                    <select id="gradoSelect" style="width: 100%; border: none; outline: none; background: transparent; padding: 10px; color: #333;">
                        </select>
                </div>
            </div>
        </div>

        <div id="camposProfesor" style="display: none;">
            
            <div class="input-group">
                <label class="input-label" for="seccionProfesor">Sección</label>
                <div class="input-control">
                    <span class="input-icon"> 
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="7" r="4"/><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>
                    </span>
                    <select id="seccionProfesor" style="width: 100%; border: none; outline: none; background: transparent; padding: 10px; color: #333;">
                        <option value="A">A</option>
                        <option value="B">B</option>
                    </select>
                </div>
            </div>

            <div class="input-group">
                <label class="input-label" for="materiaSelect">Materia</label>
                <div class="input-control">
                    <span class="input-icon"> 
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    </span>
                    <select id="materiaSelect" style="width: 100%; border: none; outline: none; background: transparent; padding: 10px; color: #333;">
                        </select>
                </div>
            </div>

            <div class="input-group">
                <label class="input-label" for="gradoProfesorSelect">Grado</label>
                <div class="input-control">
                    <span class="input-icon"> 
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                    </span>
                    <select id="gradoProfesorSelect" style="width: 100%; border: none; outline: none; background: transparent; padding: 10px; color: #333;">
                        </select>
                </div>
            </div>
        </div>
    `;

    // Inyectar HTML
    contenedorDinamico.innerHTML = htmlEstructura;

    
    const selectGrados = document.getElementById('gradoSelect');
    const selectMaterias = document.getElementById('materiaSelect');

    function llenarOpciones(selectElement, listaDatos) {
        listaDatos.forEach(dato => {
            const opcion = document.createElement('option');
            opcion.value = dato;
            opcion.textContent = dato;
            selectElement.appendChild(opcion);
        });
    }
    //Llenar las opciones
    llenarOpciones(selectGrados, grados);
    llenarOpciones(selectMaterias, materias);
    llenarOpciones(gradoProfesorSelect, grados);

    
    const rolSelect = document.getElementById('rolSelect');
    const divEstudiante = document.getElementById('camposEstudiante');
    const divProfesor = document.getElementById('camposProfesor');

    rolSelect.addEventListener('change', function() {
        const rol = this.value;

        divEstudiante.style.display = 'none';
        divProfesor.style.display = 'none';

        if (rol === 'estudiante') {
            divEstudiante.style.display = 'block';
        } else if (rol === 'profesor') {
            divProfesor.style.display = 'block';
        }
    });
});