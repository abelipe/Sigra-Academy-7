import { db } from "../../../database/db.database.mjs";
// Función para los seed para cargar los mocks dependiendo de la tabla
export async function getSeedFunctionByTable(tableName, mock){
    // Se verifica si hay datos duplicados
    const checkQuery = `SELECT COUNT(*) AS count FROM ${tableName}`;
    const [result] = await db.query(checkQuery);

    for(const item of mock){
        const columns = Object.keys(item).join(', ');
        const values = Object.values(item);
        const placeholders = values.map(() => '?').join(', ');
        const insertQuery = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
        await db.query(insertQuery, values);
    }
}