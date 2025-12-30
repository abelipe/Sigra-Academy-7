/*
let materiasOriginales = [
    { id: '001', codigo: 'MAT-101', nombre: 'Matematica', descripcion: 'Introducción a límites, derivadas y sus aplicaciones.', horas: 64, estado: 'Activo' },
    { id: '002', codigo: 'FIS-100', nombre: 'Física General', descripcion: 'Mecánica clásica, leyes de Newton y energía.', horas: 48, estado: 'Activo' },
    { id: '003', codigo: 'ING-200', nombre: 'Ingles', descripcion: 'Estudio de la lengua y gramatica.', horas: 64, estado: 'Activo' },
    { id: '004', codigo: 'QMC-101', nombre: 'Química General', descripcion: 'Estequiometría, enlaces químicos y reacciones.', horas: 48, estado: 'Activo' },
    { id: '005', codigo: 'PRG-110', nombre: 'Programación I', descripcion: 'Fundamentos de lógica y algoritmos básicos.', horas: 80, estado: 'Activo' }
];

// Esta es la lista que se mostrará y filtrará
let materias = [...materiasOriginales];
*/

// ==========================================
// DATOS INICIALES (Expandidos para Bachillerato)
// ==========================================

/* MODIFICACIÓN: Se ha agregado el atributo 'anio' a cada objeto
   para indicar a qué nivel escolar pertenece la materia.
   También se agregaron más materias de ejemplo.
*/

let materiasOriginales = [
    // --- 1er Año ---
    { id: '001', codigo: 'MAT-101', nombre: 'Matemática I', descripcion: 'Números enteros, racionales, geometría básica.', horas: 64, estado: 'Activo', anio: '1er Año' },
    { id: '002', codigo: 'CSN-101', nombre: 'Ciencias Naturales', descripcion: 'Introducción a la biología y el entorno.', horas: 48, estado: 'Activo', anio: '1er Año' },
    { id: '003', codigo: 'CAS-101', nombre: 'Castellano y Literatura I', descripcion: 'Gramática básica y comprensión lectora.', horas: 64, estado: 'Activo', anio: '1er Año' },
    { id: '004', codigo: 'ING-101', nombre: 'Inglés I', descripcion: 'Vocabulario básico y presente simple.', horas: 48, estado: 'Activo', anio: '1er Año' },
    { id: '005', codigo: 'EF-101',  nombre: 'Educación Física I', descripcion: 'Acondicionamiento neuromuscular y deporte.', horas: 32, estado: 'Activo', anio: '1er Año' },

    // --- 2do Año ---
    { id: '006', codigo: 'MAT-201', nombre: 'Matemática II', descripcion: 'Polinomios, factorización y ecuaciones lineales.', horas: 64, estado: 'Activo', anio: '2do Año' },
    { id: '007', codigo: 'BIO-201', nombre: 'Biología General', descripcion: 'La célula, sistemas del cuerpo humano.', horas: 48, estado: 'Activo', anio: '2do Año' },
    { id: '008', codigo: 'HIS-201', nombre: 'Historia Universal', descripcion: 'Desde la prehistoria hasta la edad media.', horas: 48, estado: 'Activo', anio: '2do Año' },

    // --- 3er Año ---
    { id: '009', codigo: 'FIS-301', nombre: 'Física I', descripcion: 'Cinemática: movimiento rectilíneo uniforme.', horas: 64, estado: 'Activo', anio: '3er Año' },
    { id: '010', codigo: 'QMC-301', nombre: 'Química I', descripcion: 'Estructura atómica y tabla periódica.', horas: 64, estado: 'Activo', anio: '3er Año' },
    
    // --- 4to Año (Ciclo Diversificado) ---
    { id: '011', codigo: 'FIS-401', nombre: 'Física II', descripcion: 'Dinámica, leyes de Newton y energía.', horas: 80, estado: 'Activo', anio: '4to Año' },
    { id: '012', codigo: 'QMC-401', nombre: 'Química Orgánica', descripcion: 'Compuestos del carbono, alcanos y alquenos.', horas: 80, estado: 'Activo', anio: '4to Año' },
    { id: '013', codigo: 'MAT-401', nombre: 'Matemática IV', descripcion: 'Trigonometría y funciones exponenciales.', horas: 64, estado: 'Activo', anio: '4to Año' },

    // --- 5to Año ---
    { id: '014', codigo: 'FIS-501', nombre: 'Física III', descripcion: 'Electromagnetismo y física moderna básica.', horas: 80, estado: 'Activo', anio: '5to Año' },
    { id: '015', codigo: 'MAT-501', nombre: 'Matemática V', descripcion: 'Introducción al cálculo diferencial (límites y derivadas).', horas: 80, estado: 'Activo', anio: '5to Año' },
    { id: '016', codigo: 'CS TIERRA', nombre: 'Ciencias de la Tierra', descripcion: 'Geodinámica terrestre y clima.', horas: 48, estado: 'Activo', anio: '5to Año' }
];

// Esta es la lista que se mostrará y filtrará. 
// Se inicializa con una copia de los datos originales.
let materias = [...materiasOriginales];