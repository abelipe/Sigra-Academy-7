import {createConnection} from 'mysql2/promise.js'
import { SETTINGS } from '../config/settings.config.mjs'


// Defino la conexión a la base de datos
export const db = await createConnection({
    host: SETTINGS.DB_HOST,
    user: SETTINGS.DB_USER,
    password: SETTINGS.DB_PASSWORD,
    database: SETTINGS.DB_NAME,
    port: SETTINGS.DB_PORT
});

// Función que verifica si la conexión fue exitosa
export const verifyDBConnection = async () => {
    try{
        await db.connect();
        console.log('Conexión a la base de datos exitosa');
    }
    catch(error){
        console.error('Error al conectar a la base de datos:', error);
        await db.end();
    }
}