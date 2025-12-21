import { db } from '../../../database/db.database.mjs'

export async function getUser(userId) {
	if (!userId) return null
	const query = `SELECT user_id, role_id, first_name, last_name, email, phone, is_active, created_at, updated_at FROM users WHERE user_id = ? LIMIT 1`;
	try {
		const [rows] = await db.execute(query, [userId]);
		if (!rows || rows.length === 0) return null
		return rows[0]
	} catch (error) {
		throw error
	}
}

export default { getUser }

export async function getUserByName(name) {
	if (!name) return null
	const like = `%${name}%`
	const query = `SELECT user_id, role_id, first_name, last_name, email, phone, is_active, created_at, updated_at FROM users WHERE first_name LIKE ? OR last_name LIKE ? LIMIT 1`;
	try {
		const [rows] = await db.execute(query, [like, like]);
		if (!rows || rows.length === 0) return null
		return rows[0]
	} catch (error) {
		throw error
	}
}

