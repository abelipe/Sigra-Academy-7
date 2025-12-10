// Defino el mock para los datos de prueba para la tabla de notifications
export const notificationMock = [
    {
        notification_id: 1,
        user_id: 3,
        title: 'Nueva tarea asignada',
        message: 'Se ha asignado una nueva tarea en la materia Matemáticas.',
        type: 'Alerta',
        is_read: false,
        created_at: '2024-05-01T10:00:00Z'
    }
    ,
    {
        notification_id: 2,
        user_id: 1,
        title: 'Cambio de horario',
        message: 'El horario de la clase de Historia cambió a 09:00-10:30.',
        type: 'Info',
        is_read: false,
        created_at: '2024-04-28T08:30:00Z'
    },
    {
        notification_id: 3,
        user_id: 2,
        title: 'Recordatorio: entrega',
        message: 'Recuerda entregar el resumen antes del 15 de abril.',
        type: 'Alerta',
        is_read: true,
        created_at: '2024-04-10T12:00:00Z'
    },
    {
        notification_id: 4,
        user_id: 3,
        title: 'Mensaje del docente',
        message: 'Se publicó retroalimentación en la actividad Proyecto de Ciencias.',
        type: 'Academico',
        is_read: false,
        created_at: '2024-05-13T16:20:00Z'
    },
    {
        notification_id: 5,
        user_id: 4,
        title: 'Acceso permitido',
        message: 'Tu cuenta ha sido activada por el administrador.',
        type: 'Info',
        is_read: true,
        created_at: '2024-01-02T09:00:00Z'
    },
    {
        notification_id: 6,
        user_id: 2,
        title: 'Nueva publicación',
        message: 'Se agregó un nuevo recurso: Guía de estudio.',
        type: 'Academico',
        is_read: false,
        created_at: '2024-02-01T10:05:00Z'
    },
    {
        notification_id: 7,
        user_id: 1,
        title: 'Mantenimiento programado',
        message: 'El sistema estará en mantenimiento el sábado.',
        type: 'Info',
        is_read: false,
        created_at: '2024-03-15T18:00:00Z'
    },
    {
        notification_id: 8,
        user_id: 3,
        title: 'Calificación publicada',
        message: 'Tu nota para Actividad 1 ya está disponible.',
        type: 'Academico',
        is_read: false,
        created_at: '2024-05-20T11:45:00Z'
    },
    {
        notification_id: 9,
        user_id: 4,
        title: 'Recordatorio de reunión',
        message: 'Reunión de padres el próximo lunes a las 17:00.',
        type: 'Info',
        is_read: false,
        created_at: '2024-06-01T07:30:00Z'
    }
]