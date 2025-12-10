import { db } from "../db.database.mjs";
import { 
    usersMock, 
    roleMock, 
    academicYearsMock,
    activitiesMock,
    courseResourcesMock,
    enrollmentsMock,
    gradesMock,
    finalAcademicRecordsMock,
    gradesLogMock,
    notificationMock,
    assignmentsMock,
    schedulesMock,
    sectionsMock,
    subjectsMock,
    submissionMock,
    teacherAssignmentsMock
} from "../../src/mocks/index.mjs";
import { getSeedFunctionByTable } from "../../src/core/utils/function.util.mjs";
// Función para insertar los datos de prueba en la base de datos
export const seedDatabase = async () => {
    try{
        await db.beginTransaction();
        // Se pasa primero la tabla roles por la dependencia con usuarios
        await getSeedFunctionByTable('roles', roleMock);
        console.log('Datos de roles insertados correctamente');
        await db.commit();
        // Luego se insertan los usuarios
        await getSeedFunctionByTable('users', usersMock);
        console.log('Datos de usuarios insertados correctamente');
        await db.commit();
        // Inserto el resto de los datos de prueba
        await getSeedFunctionByTable('academic_years', academicYearsMock);
        console.log('Datos de años académicos insertados correctamente');
        await db.commit();
        await getSeedFunctionByTable('grades', gradesMock);
        console.log('Datos de grados insertados correctamente');
        await db.commit();
        await getSeedFunctionByTable('sections', sectionsMock);
        console.log('Datos de secciones insertados correctamente');
        await db.commit();
        await getSeedFunctionByTable('subjects', subjectsMock);
        console.log('Datos de materias insertados correctamente');
        await db.commit();
        await getSeedFunctionByTable('enrollments', enrollmentsMock);
        console.log('Datos de inscripciones insertados correctamente');
        await db.commit();
        await getSeedFunctionByTable('activities', activitiesMock);
        console.log('Datos de actividades insertados correctamente');
        await db.commit();
        await getSeedFunctionByTable('course_resources', courseResourcesMock);
        console.log('Datos de recursos del curso insertados correctamente');
        await db.commit();
        await getSeedFunctionByTable('assignments', assignmentsMock);
        console.log('Datos de asignaciones insertados correctamente');
        await db.commit();
        await getSeedFunctionByTable('schedules', schedulesMock);
        console.log('Datos de horarios insertados correctamente');
        await db.commit();
        await getSeedFunctionByTable('teacher_assignments', teacherAssignmentsMock);
        console.log('Datos de asignaciones de profesores insertados correctamente');
        await db.commit();
        await getSeedFunctionByTable('submission', submissionMock);
        console.log('Datos de entregas insertados correctamente');
        await db.commit();
        await getSeedFunctionByTable('final_academic_records', finalAcademicRecordsMock);
        console.log('Datos de registros académicos finales insertados correctamente');
        await db.commit();
        await getSeedFunctionByTable('grades_log', gradesLogMock);
        console.log('Datos de registros de calificaciones insertados correctamente');
        await db.commit();
        await getSeedFunctionByTable('notifications', notificationMock);
        console.log('Datos de notificaciones insertados correctamente');
        await db.commit();
        console.log('Seed de la base de datos completado exitosamente');
        await db.end();
    } 
    catch (error) {
        console.error('Error al insertar los datos de prueba:', error);
        throw error;
    }
}

seedDatabase()