export const validarId = (valor, nombreCampo = "id") => {
	const numero = Number(valor);
	if (!Number.isInteger(numero) || numero <= 0) {
		const error = new Error(
			`El campo '${nombreCampo}' debe ser un entero positivo.`
		);
		error.status = 400;
		throw error;
	}
	return numero;
};

export function validarListaIds(valor, nombreCampo = "ids", opts = {}) {
	const { allowEmpty = false } = opts;
	if (!Array.isArray(valor)) {
		throw new Error(`${nombreCampo} debe ser un arreglo`);
	}
	if (!allowEmpty && valor.length === 0) {
		throw new Error(`${nombreCampo} no puede estar vacío`);
	}
	return valor.map((v, i) => validarId(v, `${nombreCampo}[${i}]`));
}
