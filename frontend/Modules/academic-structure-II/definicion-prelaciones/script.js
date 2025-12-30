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
    
    // Elementos para el modal de prelaciones recientes
    const viewAllBtn = document.getElementById('view-all-prelaciones');
    const prelacionesModal = document.getElementById('prelaciones-modal');
    const closePrelacionesModal = document.getElementById('close-prelaciones-modal');
    const prelacionesList = document.getElementById('prelaciones-list');
    
    // Botón Cancelar de la configuración
    const cancelConfigBtn = document.getElementById('cancel-config-btn');
    
    let filaAEliminar = null;
    let materiaPrincipalSeleccionada = null;

    // Datos de las materias del PDF (1er y 2do año)
    const materias = [
        // Primer Año
        { codigo: 'MAT-204', nombre: 'Matematica I', año: '1er Año' },
        { codigo: 'FIS-201', nombre: 'Fisica I', año: '1er Año' },
        { codigo: 'QUI-299', nombre: 'Quimica I', año: '1er Año' },
        { codigo: 'BIO-501', nombre: 'Biologia I', año: '1er Año' },
        { codigo: 'COM-403', nombre: 'Computacion I', año: '1er Año' },
        { codigo: 'DIB-309', nombre: 'Dibujo I', año: '1er Año' },
        { codigo: 'LIT-199', nombre: 'Lenguaje y Literatura I', año: '1er Año' },
        { codigo: 'HIS-101', nombre: 'Historia General', año: '1er Año' },
        { codigo: 'GEO-301', nombre: 'Geografía I', año: '1er Año' },
        { codigo: 'DEP-401', nombre: 'Deporte I', año: '1er Año' },
        { codigo: 'ING-601', nombre: 'Ingles I', año: '1er Año' },
        // Segundo Año
        { codigo: 'MAT-205', nombre: 'Matematica II', año: '2do Año' },
        { codigo: 'FIS-202', nombre: 'Fisica II', año: '2do Año' },
        { codigo: 'QUI-300', nombre: 'Quimica II', año: '2do Año' },
        { codigo: 'BIO-502', nombre: 'Biologia II', año: '2do Año' },
        { codigo: 'COM-404', nombre: 'Computacion II', año: '2do Año' },
        { codigo: 'DIB-310', nombre: 'Dibujo II', año: '2do Año' },
        { codigo: 'LIT-200', nombre: 'Lenguaje y Literatura II', año: '2do Año' },
        { codigo: 'HIS-102', nombre: 'Historia II', año: '2do Año' },
        { codigo: 'GEO-302', nombre: 'Geografía II', año: '2do Año' },
        { codigo: 'DEP-402', nombre: 'Deporte II', año: '2do Año' },
        { codigo: 'ING-602', nombre: 'Ingles II', año: '2do Año' }
    ];

    // Datos de ejemplo para prelaciones recientes
    const todasLasPrelaciones = [
        {
            codigo: 'FIS-203',
            nombre: 'Física II',
            fecha: 'Hace 2 horas',
            requisitos: ['FIS-201 Física I', 'MAT-204 Matemática I']
        },
        {
            codigo: 'GEO-302',
            nombre: 'Geografía II',
            fecha: 'Ayer',
            requisitos: ['GEO-301 Geografía I']
        },
        {
            codigo: 'HIS-101',
            nombre: 'Historia General',
            fecha: 'Ayer',
            requisitos: []
        },
        {
            codigo: 'MAT-205',
            nombre: 'Matemática II',
            fecha: 'Hace 3 días',
            requisitos: ['MAT-204 Matemática I']
        },
        {
            codigo: 'QUI-300',
            nombre: 'Química II',
            fecha: 'Hace 3 días',
            requisitos: ['QUI-299 Química I']
        },
        {
            codigo: 'BIO-502',
            nombre: 'Biología II',
            fecha: 'Hace 4 días',
            requisitos: ['BIO-501 Biología I', 'QUI-299 Química I']
        },
        {
            codigo: 'COM-404',
            nombre: 'Computación II',
            fecha: 'Hace 5 días',
            requisitos: ['COM-403 Computación I']
        },
        {
            codigo: 'DIB-310',
            nombre: 'Dibujo II',
            fecha: 'Hace 5 días',
            requisitos: ['DIB-309 Dibujo I']
        },
        {
            codigo: 'LIT-200',
            nombre: 'Lenguaje y Literatura II',
            fecha: 'Hace 1 semana',
            requisitos: ['LIT-199 Lenguaje y Literatura I']
        },
        {
            codigo: 'ING-602',
            nombre: 'Inglés II',
            fecha: 'Hace 1 semana',
            requisitos: ['ING-601 Inglés I']
        }
    ];

    // Función para buscar materia por código o nombre
    function buscarMateria(texto) {
        const textoLower = texto.toLowerCase().trim();
        
        // Buscar por código
        let materia = materias.find(m => 
            m.codigo.toLowerCase() === textoLower || 
            textoLower.includes(m.codigo.toLowerCase())
        );
        
        // Si no se encuentra por código, buscar por nombre
        if (!materia) {
            materia = materias.find(m => 
                m.nombre.toLowerCase().includes(textoLower) ||
                textoLower.includes(m.nombre.toLowerCase())
            );
        }
        
        // Si no se encuentra por nombre exacto, buscar por coincidencia parcial
        if (!materia) {
            materia = materias.find(m => 
                m.nombre.toLowerCase().includes(textoLower.replace(/\s+/g, ' ')) ||
                `${m.codigo} — ${m.nombre}`.toLowerCase().includes(textoLower)
            );
        }
        
        return materia;
    }

    // Función para llenar el select de prerrequisitos
    function llenarSelectPrerrequisitos(materiaPrincipal = null) {
        // Limpiar select
        prereqSelect.innerHTML = '<option>Seleccione una asignatura...</option>';
        
        // Agregar todas las materias excepto la materia principal seleccionada
        materias.forEach(materia => {
            // No incluir la materia principal en la lista de prerrequisitos
            if (!materiaPrincipal || materia.codigo !== materiaPrincipal.codigo) {
                const option = document.createElement('option');
                option.value = materia.codigo;
                option.textContent = `${materia.codigo} — ${materia.nombre}`;
                option.dataset.año = materia.año;
                prereqSelect.appendChild(option);
            }
        });
    }

    // Función para cargar las prelaciones en el modal
    function cargarPrelacionesModal() {
        prelacionesList.innerHTML = '';
        
        todasLasPrelaciones.forEach(prelacion => {
            const prelacionItem = document.createElement('div');
            prelacionItem.className = 'prelacion-modal-item';
            
            let requisitosHTML = '';
            if (prelacion.requisitos.length > 0) {
                requisitosHTML = `
                    <div class="prelacion-requisitos">
                        ${prelacion.requisitos.map(req => `
                            <span class="requisito-badge">
                                <i class="fa-solid fa-arrow-right"></i> ${req}
                            </span>
                        `).join('')}
                    </div>
                `;
            } else {
                requisitosHTML = `
                    <div class="prelacion-requisitos">
                        <span class="sin-prelaciones-badge">
                            <i class="fa-solid fa-circle-check"></i> Sin prelaciones
                        </span>
                    </div>
                `;
            }
            
            prelacionItem.innerHTML = `
                <div class="prelacion-header">
                    <span class="prelacion-codigo">${prelacion.codigo}</span>
                    <span class="prelacion-fecha">
                        <i class="fa-solid fa-clock"></i> ${prelacion.fecha}
                    </span>
                </div>
                <div class="prelacion-title">${prelacion.nombre}</div>
                ${requisitosHTML}
            `;
            
            prelacionesList.appendChild(prelacionItem);
        });
    }

    // Inicializar el select de prerrequisitos
    llenarSelectPrerrequisitos();

    // --- 1. Buscar y Seleccionar Materia Principal ---
    if (materiaSearch) {
        // Cuando el campo de búsqueda pierde el foco (se sale del campo)
        materiaSearch.addEventListener('change', function() {
            const textoBusqueda = this.value.trim();
            
            if (textoBusqueda) {
                const materia = buscarMateria(textoBusqueda);
                
                if (materia) {
                    // Actualizar la información mostrada
                    selectedMateriaTitle.textContent = `${materia.codigo} — ${materia.nombre}`;
                    selectedMateriaYear.textContent = materia.año;
                    
                    // Mostrar el contenedor
                    selectedMateriaContainer.style.display = 'flex';
                    selectedMateriaContainer.style.opacity = '1';
                    
                    // Guardar la materia seleccionada
                    materiaPrincipalSeleccionada = materia;
                    
                    // Actualizar el select de prerrequisitos (excluyendo la materia principal)
                    llenarSelectPrerrequisitos(materia);
                    
                    // Limpiar el campo de búsqueda
                    this.value = '';
                } else {
                    alert('Materia no encontrada. Por favor, verifique el código o nombre e intente nuevamente.');
                }
            }
        });

        // También permitir selección con Enter
        materiaSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                this.dispatchEvent(new Event('change'));
            }
        });
    }

    // --- 2. Limpiar Materia Seleccionada ---
    if (clearMateriaBtn) {
        clearMateriaBtn.addEventListener('click', () => {
            selectedMateriaContainer.style.opacity = '0';
            setTimeout(() => {
                selectedMateriaContainer.style.display = 'none';
            }, 300);
            
            materiaPrincipalSeleccionada = null;
            
            // Resetear el select de prerrequisitos para incluir todas las materias
            llenarSelectPrerrequisitos();
        });
    }

    // --- 3. Añadir Prerrequisito ---
    if (addPrereqBtn) {
        addPrereqBtn.addEventListener('click', () => {
            const selectedOption = prereqSelect.options[prereqSelect.selectedIndex];
            
            if (selectedOption.value && selectedOption.text !== 'Seleccione una asignatura...') {
                const newItem = document.createElement('div');
                newItem.classList.add('prereq-item');
                newItem.innerHTML = `
                    <div class="prereq-code">${selectedOption.value}</div>
                    <div class="prereq-details">
                        <strong>${selectedOption.text.split('—')[1].trim()}</strong>
                        <span>${selectedOption.dataset.año}</span>
                    </div>
                    <button class="delete-prereq-btn"><i class="fa-solid fa-trash-can"></i></button>
                `;
                newItem.style.animation = "fadeIn 0.5s";
                prereqList.appendChild(newItem);
                
                // Resetear el select
                prereqSelect.selectedIndex = 0;
            }
        });
    }

    // --- 4. Eliminar Prerrequisitos de la lista pequeña ---
    if (prereqList) {
        prereqList.addEventListener('click', (e) => {
            const btn = e.target.closest('.delete-prereq-btn');
            if (btn) {
                const item = btn.closest('.prereq-item');
                item.style.opacity = '0';
                item.style.transform = 'translateX(20px)';
                item.style.transition = 'all 0.3s ease';
                setTimeout(() => item.remove(), 300);
            }
        });
    }

    // --- 5. Eliminar de la Tabla con Modal y Efecto de Contracción ---
    const cerrarModal = () => {
        if(deleteModal) {
            deleteModal.classList.remove('active');
            filaAEliminar = null;
        }
    };

    if (tableBody) {
        tableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('fa-trash-can')) {
                filaAEliminar = e.target.closest('tr');
                if(deleteModal) deleteModal.classList.add('active');
            }
        });
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            if (filaAEliminar) {
                // Aplicamos la clase que reduce el tamaño y oculta
                filaAEliminar.classList.add('row-collapsing');
                
                // Esperamos a que la transición de CSS termine antes de remover
                setTimeout(() => {
                    filaAEliminar.remove();
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

    // --- 6. Simular Guardado ---
    if(saveBtn) {
        saveBtn.addEventListener('click', () => {
            // Validar que se haya seleccionado una materia principal
            if (!materiaPrincipalSeleccionada) {
                alert('Por favor, seleccione una materia principal primero.');
                return;
            }
            
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
            saveBtn.disabled = true;
            
            setTimeout(() => {
                saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Guardado';
                saveBtn.style.backgroundColor = '#059669';
                
                // Mostrar mensaje de éxito
                alert(`Prelaciones guardadas exitosamente para ${materiaPrincipalSeleccionada.codigo} - ${materiaPrincipalSeleccionada.nombre}`);
                
                setTimeout(() => {
                    saveBtn.innerHTML = originalText;
                    saveBtn.style.backgroundColor = '';
                    saveBtn.disabled = false;
                }, 2000);
            }, 1500);
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