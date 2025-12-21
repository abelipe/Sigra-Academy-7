import { getUser as getUserModel, getUserByName as getUserByNameModel } from './control.model.mjs'

export async function getUser(req, res) {
	try {
		const { id } = req.params
		const userId = Number(id)
		if (!userId || Number.isNaN(userId)) {
			return res.status(400).json({ message: 'Invalid user id' })
		}

		const user = await getUserModel(userId)
		if (!user) return res.status(404).json({ message: 'User not found' })

		// Normalize response keys (optional)
		const result = {
			id: user.user_id,
			role_id: user.role_id,
			first_name: user.first_name,
			last_name: user.last_name,
			email: user.email,
			phone: user.phone,
			is_active: Boolean(user.is_active),
			created_at: user.created_at,
			updated_at: user.updated_at
		}

		return res.status(200).json(result)
	} catch (error) {
		console.error('getUser controller error:', error)
		return res.status(500).json({ message: 'Internal server error' })
	}
}

export async function getUserByName(req, res) {
	try {
		const { name } = req.params
		if (!name || typeof name !== 'string' || name.trim() === '') {
			return res.status(400).json({ message: 'Invalid name parameter' })
		}

		const user = await getUserByNameModel(name)
		if (!user) return res.status(404).json({ message: 'User not found' })

		const result = {
			id: user.user_id,
			role_id: user.role_id,
			first_name: user.first_name,
			last_name: user.last_name,
			email: user.email,
			phone: user.phone,
			is_active: Boolean(user.is_active),
			created_at: user.created_at,
			updated_at: user.updated_at
		}

		return res.status(200).json(result)
	} catch (error) {
		console.error('getUserByName controller error:', error)
		return res.status(500).json({ message: 'Internal server error' })
	}
}

export default { getUser }

