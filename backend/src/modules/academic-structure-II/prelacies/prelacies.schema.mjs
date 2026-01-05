export const validateCreatePayload = (body) => {
	const errors = [];
	if (!body) {
		errors.push('Body is required');
		return errors;
	}
	const subject_id = Number(body.subject_id);
	const prerequisite_id = Number(body.prerequisite_id);
	if (!subject_id || Number.isNaN(subject_id)) errors.push('subject_id is required and must be a number');
	if (!prerequisite_id || Number.isNaN(prerequisite_id)) errors.push('prerequisite_id is required and must be a number');
	if (subject_id && prerequisite_id && subject_id === prerequisite_id) errors.push('subject_id and prerequisite_id must be different');
	return errors;
}

