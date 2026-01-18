import { db } from '../../../database/db.database.mjs';
import { assignTokenToSession } from '../../core/utils/function.util.mjs';
import bcrypt from 'bcryptjs';

// Modelo que interactua con la tabla users de la base de datos
export class UserModel {
	
	// Método para obtener todos los usuarios
	static async getAllUsers(){
		const [users] = await db.query(
			`SELECT * FROM users`
		);
		if(users.length === 0) return {error: 'No hay usuarios registrados'};
		return {
			message: 'Usuarios obtenidos correctamente',
			users: users
		}
	}
	
	// Método para obtener un usuario por su ID
	static async getUserById(userId) {
		if(!userId) return {error: 'El ID de usuario es requerido'};
		const [user] = await db.query(
			`SELECT * FROM users WHERE user_id = ?`,
			[userId]
		);
		if(user.length === 0) return {error: 'Usuario no encontrado'};
		return {
			message: 'Usuario obtenido correctamente',
			user: user
		}
	}

	// Método para obtener un usuario por su email
	static async getUserByEmail(emailUser){
		if(!emailUser) return {error: 'El email es requerido'};
		const [user] = await db.query(
			`SELECT * FROM users WHERE email = ?`,
			[emailUser]
		);
		if(user.length === 0) return {error: 'Usuario no encontrado'};
		return {
			message: 'Usuario obtenido correctamente',
			user: user
		}
	}

	// Método para crear un nuevo usuario
	static async createUser(data){
		if(!data) return {error: 'Faltan datos para crear el usuario'};
		const {role_id, ...rest}  = data;
		// Se verifica si el rol existe
		const [existingRole] = await db.query(
			`SELECT * FROM roles WHERE role_id = ?`,
			[role_id]
		);
		// A su vez, se verfica si ya existe un usuario con el mismo email
		const [existingEmail] = await db.query(
			`SELECT * FROM users WHERE email = ?`,
			[rest.email]
		);
		if(!existingRole.length || existingEmail.length > 0){
			return {error: 'Rol no encontrado o email ya existe'};
		}
		// Si todo esta bien, se crea el usuario, se hashea la contraseña
		const hashedPassword = await bcrypt.hash(rest.password_hash, 10);
		const [result] = await db.query(
			`INSERT INTO users (role_id, first_name, last_name, email, phone, password_hash)
			VALUES (?, ?, ?, ?, ?, ?)`,
			[role_id, rest.first_name, rest.last_name, rest.email, rest.phone, hashedPassword]
		);
		// Se obtiene el usuario creado
		const [createdUser] = await db.query(
			`SELECT * FROM users WHERE user_id = ?`,
			[result.insertId]
		);
		if(createdUser.affectedRows === 0) return {error: 'Error al crear el usuario'};
		const {password_hash, ...userWithoutPassword} = createdUser[0];
		return {
			message: 'Usuario creado correctamente',
			user: userWithoutPassword
		}
	}

	// Método para loguear un usuario
	static async loginUser(data){
		if(!data) return {error: 'Faltan datos para iniciar sesión'};
		const {email, password_hash} = data;
		// Se verifica si el usuario existe
		const [existingUser] = await db.query(
			`SELECT * FROM users WHERE email = ?`,
			[email]
		);
		if(existingUser.length === 0) return {error: 'Usuario no encontrado'};
		// Comparar la contraseña ingresada contra el hash almacenado.
		// Se agrega un fallback para filas antiguas con contraseña sin hash.
		let passwordMatch = false;
		const storedHash = existingUser[0].password_hash || '';
		try{
			passwordMatch = await bcrypt.compare(password_hash, storedHash);
		}catch(_err){
			passwordMatch = false;
		}
		if(!passwordMatch){
			passwordMatch = (password_hash === storedHash);
		}
		if(!passwordMatch) return {error: 'Contraseña incorrecta'};
		// Si es correcta, se asigna el token de sesión
		const token = await assignTokenToSession(existingUser[0].user_id);
		if(!token) return {error: 'Error al asignar el token de sesión'};
		// Una vez asignado el token, se verifica la tabla login_session para ver si ya existe una sesión activa
		const [existingSession] = await db.query(
			`SELECT * FROM login_session WHERE user_id = ? AND is_active = TRUE`,
			[existingUser[0].user_id]
		);
		if(existingSession.length === 0){
			// Si no existe una sesión activa, se crea una nueva
			await db.query(
				`INSERT INTO login_session (user_id, token, expires_at)
				VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 2 HOUR))`,
				[existingUser[0].user_id, token]
			);
			return {
				message: 'Inicio de sesión exitoso',
				user: existingUser,
				token: token
			}
		}else{
			// Si ya existe una sesión activa, se actualiza el token y el estado de la sesión
			await db.query(
				`UPDATE login_session SET token = ?, expires_at = DATE_ADD(NOW(), INTERVAL 2 HOUR) WHERE id = ?`,
				[token, existingSession[0].id]
			);
			return {
				message: 'Inicio de sesión exitoso',
				user: existingUser,
				token: token
			}
		}
	}

	// Método para cerrar la sesión de un usuario
	static async LogoutUser(userId){
		if(!userId) return {error: 'El ID de usuario es requerido'};
		// Se verifica si el usuario tiene una sesión activa
		const [existingSession] = await db.query(
			`SELECT * FROM login_session WHERE user_id = ? AND is_active = TRUE`,
			[userId]
		);
		if(existingSession.length === 0) return {error: 'No hay una sesión activa para este usuario'};
		// Si existe una sesión activa, se cierra la sesión, limpiando o quitado el token
		await db.query(
			`UPDATE login_session SET is_active = FALSE, token = NULL WHERE id = ?`,
			[existingSession[0].id]
		);
		return {
			message: 'Sesión cerrada correctamente'
		}
	}

	// Método para actualizar un usuario
	static async updateUser(userId, data){
		if(!userId || !data) return {error: 'Faltan datos para actualizar el usuario'};
		// Se asigna los campos que se van a actualizar
		const allowedFields = ['role_id', 'first_name', 'last_name', 'email', 'phone', 'password_hash', 'is_active'];
		const updateToFields = {};
		for(const field of allowedFields){
			if(data[field] !== undefined){
				updateToFields[field] = data[field];
			}
		}
		// Si se va a actualizar la contraseña, se hashea
		if(updateToFields.password_hash){
			updateToFields.password_hash = await bcrypt.hash(updateToFields.password_hash, 10);
		}
		// Se verifica si existe el usuario
		const [existingUser] = await db.query(
			`SELECT * FROM users WHERE user_id = ?`,
			[userId]
		);
		if(existingUser.length === 0) return {error: 'Usuario no encontrado'};
		// Si existe, se procede a actualizarlo
		const fields = [];
		const values = [];

		Object.entries(updateToFields).forEach(([key, value]) => {
			fields.push(`${key} = ?`);
			values.push(value);
		});
		values.push(userId); // Agrega el userId al final para la cláusula WHERE
		const [updatedUser] = await db.query(
			`UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`,
			values
		);
		if(updatedUser.affectedRows === 0) return {error: 'Error al actualizar el usuario'};
		// Se obtiene el usuario actualizado
		const [user] = await db.query(
			`SELECT * FROM users WHERE user_id = ?`,
			[userId]
		);
		return {
			message: 'Usuario actualizado correctamente',
			user: user
		}
	}

	// Método para borrar un usuario
	static async deleteUser(userId){
		if(!userId) return {error: 'El ID de usuario es requerido'};
		// Se verifica si el usuario existe
		const [existingUser] = await db.query(
			`SELECT * FROM users WHERE user_id = ?`,
			[userId]
		);
		if(existingUser.length === 0) return {error: 'Usuario no encontrado'};
		// Si existe, se borra el usuario
		await db.query(
			`DELETE FROM users WHERE user_id = ?`,
			[userId]
		);
		return {
			message: 'Usuario borrado correctamente'
		}
	}
}