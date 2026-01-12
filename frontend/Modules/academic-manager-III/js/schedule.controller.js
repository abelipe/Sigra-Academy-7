// Configuración API y orden de días
const API_URL = 'http://localhost:3000/api/academic-manager';
const STUDENT_ID = 3;
const dayOrder = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const stepMinutes = 30; // intervalo de 30 minutos para el grid

// Mapear asignaturas a clases de color existentes en el CSS
const colorMap = {
    'Matemáticas I': 'matematicas',
    'Matemáticas III': 'matematicas',
    'Matemáticas': 'matematicas',
    'Biología': 'biologia',
    'Ciencias Naturales I': 'biologia',
    'Ciencias Sociales': 'castellano',
    'Historia y Geografía': 'castellano',
    'Física': 'fisica',
    'Química': 'quimica',
    'Castellano': 'castellano'
};

const normalizeDay = (day) => {
    if (!day) return day;
    const map = { 'Lunes': 'Lunes', 'Martes': 'Martes', 'Miercoles': 'Miércoles', 'Miércoles': 'Miércoles', 'Jueves': 'Jueves', 'Viernes': 'Viernes' };
    return map[day] || day;
};

const timeToMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
};

const minutesToLabel = (m) => {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hh12 = h % 12 === 0 ? 12 : h % 12;
    const mmStr = mm.toString().padStart(2, '0');
    return `${hh12}:${mmStr} ${suffix}`;
};

async function loadSchedule() {
    try {
        const res = await fetch(`${API_URL}/schedule/${STUDENT_ID}`);
        if (!res.ok) {
            console.error('Schedule API returned', res.status, res.statusText);
            return buildGrid(defaultSchedule());
        }
        const { success, data } = await res.json();
        if (!success || !Array.isArray(data)) return buildGrid(defaultSchedule());
        buildGrid(buildScheduleDataFromAPI(data));
    } catch (e) {
        console.error(e);
        buildGrid(defaultSchedule());
    }
}

function buildScheduleDataFromAPI(entries) {
    // Normalizar días y obtener rangos de tiempo
    const normalized = entries.map(e => ({
        ...e,
        day_of_week: normalizeDay(e.day_of_week)
    })).filter(e => dayOrder.includes(e.day_of_week));

    if (!normalized.length) return defaultSchedule();

    const minStart = Math.min(...normalized.map(e => timeToMinutes(e.start_time.slice(0,5))));
    const maxEnd = Math.max(...normalized.map(e => timeToMinutes(e.end_time.slice(0,5))));

    // Generar slots en pasos de 30 minutos
    const times = [];
    for (let m = minStart; m <= maxEnd; m += stepMinutes) {
        times.push(minutesToLabel(m));
    }

    const classes = {};
    dayOrder.forEach(d => { classes[d] = {}; });

    normalized.forEach(e => {
        const startMin = timeToMinutes(e.start_time.slice(0,5));
        const endMin = timeToMinutes(e.end_time.slice(0,5));
        const span = Math.max(1, Math.ceil((endMin - startMin) / stepMinutes));
        const startLabel = minutesToLabel(startMin);
        const color = colorMap[e.subject_name] || 'matematicas';

        classes[e.day_of_week][startLabel] = {
            name: e.subject_name,
            room: e.classroom || '',
            span,
            color
        };
    });

    return { times, days: dayOrder, classes };
}

function defaultSchedule() {
    return {
        times: ['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM'],
        days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
        classes: {}
    };
}

function buildGrid(scheduleData) {
    const container = document.getElementById('scheduleContainer');
    container.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'schedule-grid';

    // Header
    const header = document.createElement('div');
    header.className = 'schedule-header';

    const cornerCell = document.createElement('div');
    cornerCell.className = 'time-header';
    header.appendChild(cornerCell);

    scheduleData.days.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.textContent = day;
        header.appendChild(dayHeader);
    });

    grid.appendChild(header);

    const occupiedCells = {};

    scheduleData.times.forEach((time, timeIndex) => {
        const timeCell = document.createElement('div');
        timeCell.className = 'time-cell';
        timeCell.textContent = time;
        grid.appendChild(timeCell);

        scheduleData.days.forEach((day, dayIndex) => {
            const cellKey = `${dayIndex}-${timeIndex}`;
            const classCell = document.createElement('div');
            classCell.className = 'class-cell';

            // Si la celda está ocupada por un bloque que abarca varias filas, ocultamos bordes
            if (occupiedCells[cellKey]) {
                classCell.classList.add('spanned-cell');
                grid.appendChild(classCell);
                return;
            }

            const classInfo = scheduleData.classes[day]?.[time];

            if (classInfo && !occupiedCells[cellKey]) {
                const classBlock = document.createElement('div');
                classBlock.className = `class-block ${classInfo.color}`;

                const className = document.createElement('div');
                className.className = 'class-name';
                className.textContent = classInfo.name;

                const classRoom = document.createElement('div');
                classRoom.className = 'class-room';
                classRoom.textContent = classInfo.room;

                classBlock.appendChild(className);
                classBlock.appendChild(classRoom);
                classCell.appendChild(classBlock);

                if (classInfo.span > 1) {
                    classBlock.style.bottom = `calc(-100% * ${classInfo.span - 1} + ${(classInfo.span - 1) * 4}px)`;
                    for (let i = 1; i < classInfo.span; i++) {
                        occupiedCells[`${dayIndex}-${timeIndex + i}`] = true;
                    }
                }
            }

            grid.appendChild(classCell);
        });
    });

    container.appendChild(grid);
}

document.addEventListener('DOMContentLoaded', loadSchedule);