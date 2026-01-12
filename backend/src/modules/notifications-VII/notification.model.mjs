import {db} from '../../../database/db.database.mjs';

export class NotificationModel {
    // Metodo para obtener todas las notificaciones del sistema
    static async getAllNotifications() {
        const [notifications] = await db.query ('SELECT * FROM notifications');
        if (notifications.length === 0) return {error: ' no hay notificaciones en el sistema'};
        return {
            message: 'notificaciones obtenidas exitosamente',
            notifications: notifications
        }
    }
    // ################################################################
    static async createNotification({ user_id, message, type }) {
        try {
            // VALIDACIÓN: Verificar si el usuario existe
            const [user] = await db.query('SELECT id FROM users WHERE user_id = ?', [user_id]);
            
            if (user.length === 0) {
                return { error: `El usuario con ID ${user_id} no existe.`, code: 404 };
            }

            // Si existe, procedemos a crear la notificación
            const [result] = await db.query(
                'INSERT INTO notifications (user_id, message, type, title) VALUES (?, ?, ?, ?)',
                [user_id, message, type, title]
            );

            return {
                message: 'Notificación creada exitosamente',
                id: result.insertId
            };
        } catch (error) {
            return { error: 'Error en la base de datos: ' + error.message, code: 500 };
        }
    }
    //###########################################################################
    // NUEVO MÉTODO: Actualizar notificación
    static async updateNotification(id, data) {
    const { title, message, is_read } = data;

    try {
        // 1. Verificar si la notificación existe
        const [existing] = await db.query('SELECT id FROM notifications WHERE notification_id = ?', [id]);
        if (existing.length === 0) {
            return { error: 'La notificación no existe', code: 404 };
        }

        // 2. Construir la consulta dinámica
        const fields = [];
        const values = [];

        if (title !== undefined) {
            fields.push('title = ?');
            values.push(title);
        }
        if (message !== undefined) {
            fields.push('message = ?');
            values.push(message);
        }
        if (is_read !== undefined) {
            fields.push('is_read = ?');
            values.push(is_read);
        }

        // Si no hay campos para actualizar, retornar temprano
        if (fields.length === 0) {
            return { error: 'No se proporcionaron campos para actualizar', code: 400 };
        }

        // 3. Ejecutar la actualización
        const sql = `UPDATE notifications SET ${fields.join(', ')} WHERE id = ?`;
        values.push(id); // Agregar el ID al final para el WHERE

        await db.query(sql, values);

        return { 
            message: 'Notificación actualizada exitosamente',
            notification: { id, ...data }
        };

    } catch (error) {
        return { error: 'Error en la base de datos: ' + error.message, code: 500 };
    }
}
    // NUEVO MÉTODO: Eliminar notificación
    static async deleteNotification(id) {
        try {
            // 1. Verificar si la notificación existe antes de borrar
            const [existing] = await db.query('SELECT id FROM notifications WHERE notification_id = ?', [id]);
            
            if (existing.length === 0) {
                return { error: 'La notificación que intenta eliminar no existe', code: 404 };
            }

            // 2. Ejecutar el borrado físico
            await db.query('DELETE FROM notifications WHERE notification_id = ?', [id]);

            return { message: 'Notificación eliminada correctamente' };
        } catch (error) {
            return { error: 'Error al eliminar en la base de datos: ' + error.message, code: 500 };
        }
    }
    // NUEVO MÉTODO: Obtener una notificación por ID
    static async getNotificationById(id) {
        try {
            const [notification] = await db.query('SELECT * FROM notifications WHERE notification_id = ?', [id]);
            
            // Si el array está vacío, la notificación no existe
            if (notification.length === 0) {
                return { error: `La notificación con ID ${id} no existe`, code: 404 };
            }

            return {
                message: 'Notificación obtenida con éxito',
                notification: notification[0] // Retornamos solo el objeto, no el array
            };
        } catch (error) {
            return { error: 'Error en la base de datos: ' + error.message, code: 500 };
        }
    }
    // NUEVO MÉTODO: Obtener todas las notificaciones de un usuario específico
    static async getNotificationsByUserId(user_id) {
        try {
            // 1. Opcional: Validar si el usuario existe (basado en tu requerimiento anterior)
            const [user] = await db.query('SELECT id FROM users WHERE user_id = ?', [user_id]);
            if (user.length === 0) {
                return { error: `El usuario con ID ${user_id} no existe`, code: 404 };
            }

            // 2. Consultar todas las notificaciones de ese usuario
            const [notifications] = await db.query(
                'SELECT * FROM notifications WHERE user_id = ?', 
                [user_id]
            );

            return {
                message: notifications.length > 0 
                    ? `Notificaciones del usuario ${user_id} obtenidas` 
                    : 'El usuario no tiene notificaciones actualmente',
                notifications: notifications
            };
        } catch (error) {
            return { error: 'Error en la base de datos: ' + error.message, code: 500 };
        }
    }
}

