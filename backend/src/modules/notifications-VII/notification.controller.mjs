export class NotificationController {
    constructor ({NotificationModel}){
        this.NotificationModel = NotificationModel;
    }
    // Metodo para obtener todas las notificaciones del sistema
    getAllNotifications = async (req, res) => {
        try {
            const result = await this.NotificationModel.getAllNotifications();
            if (result.error) return res.status(404).json({error: result.error});
            return res.status(200).json({ 
                message: result.message,
                notifications: result.notifications
            });
        } catch (error) {
            return res.status(500).json({error: error.message});
        }
    }
    // NUEVO MÉTODO: Manejar la creación

    createNotification = async (req, res) => {
        const { user_id, message, type } = req.body;

        if (!user_id || !message) {
            return res.status(400).json({ error: 'Faltan campos obligatorios ID del usuario y el mensaje' });
        }

        try {
            const result = await this.NotificationModel.createNotification({ user_id, message, type });
            
            // Si el modelo devuelve un error, usamos el código de estado que nos envió
            if (result.error) {
                return res.status(result.code || 400).json({ error: result.error });
            }
            
            return res.status(201).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    //que haga la validacion
    // NUEVO MÉTODO: Manejar la actualización
    updateNotification = async (req, res) => {
    const { id } = req.params;
    const validation = validateUpdateNotification(req.body); //SE CORRIGIO AQUÍ

    try {
        if (!validation.success) {
            return res.status(400).json({
                error: 'Datos de notificación inválidos para actualización.',
                details: validation.error
            });
        }

        const result = await this.NotificationModel.updateNotification(id, validation.data);
        
        if (result.error) {
            return res.status(result.code || 400).json({ error: result.error });
        }

        return res.status(200).json({
            message: result.message,
            notification: result.notification
        });

    } catch (error) {
        console.error('Error en NotificationController.updateNotification:', error);
        return res.status(500).json({
            error: `Error del servidor al actualizar la notificación.`
        });
    }
}
    // NUEVO MÉTODO: Manejar la eliminación
    deleteNotification = async (req, res) => {
        const { id } = req.params; // Extraemos el ID de la URL

        try {
            const result = await this.NotificationModel.deleteNotification(id);
            
            if (result.error) {
                return res.status(result.code || 400).json({ error: result.error });
            }
            
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    // NUEVO MÉTODO: Manejar la búsqueda por ID
    getNotificationById = async (req, res) => {
        const { id } = req.params;

        try {
            const result = await this.NotificationModel.getNotificationById(id);
            
            if (result.error) {
                return res.status(result.code || 400).json({ error: result.error });
            }
            
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    // NUEVO MÉTODO: Manejar la búsqueda por ID de usuario
    getNotificationsByUserId = async (req, res) => {
        const { userId } = req.params; // Captura el ID del usuario de la URL

        try {
            const result = await this.NotificationModel.getNotificationsByUserId(userId);
            
            if (result.error) {
                return res.status(result.code || 400).json({ error: result.error });
            }
            
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}



