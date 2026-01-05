import { Router } from 'express';
import { GradesLogRoutes } from '../../modules/grades-record-V/grades/grades.route.mjs';
import { SETTINGS } from '../../../config/settings.config.mjs';
import { RecordsRoutes } from '../../modules/grades-record-V/records/records.route.mjs'; 

const router = Router();

// Definir todas las rutas de los modulos aquí
export const ListRoutes = {
    grades: {
        grades: router.use(`${SETTINGS.BASE_PATH}/grades-log`, GradesLogRoutes),
        records: router.use(`${SETTINGS.BASE_PATH}/records`, RecordsRoutes)
    }
}