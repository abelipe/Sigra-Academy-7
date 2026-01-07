import express from "express";
import cors from "cors";
import morgan from "morgan";
import { SETTINGS } from "./config/settings.config.mjs";
import controlRouter from "./src/modules/access-control-I/control.route.mjs";
import { getUser as getUserModel } from "./src/modules/access-control-I/control.model.mjs";
import { subjectRoute } from "./src/modules/academic-structure-II/subjects/subjects.route.mjs";
import { prelaciesRoute } from "./src/modules/academic-structure-II/prelacies/prelacies.route.mjs";
import managementRoute from "./src/modules/academic-structure-II/management/management.route.mjs";

const app = express();

// ===== CORS (Live Server) =====
const CORS_OPCIONES = {
	origin: true, // Allow all origins
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(CORS_OPCIONES));
app.options(/.*/, cors(CORS_OPCIONES));

app.use(express.json());
app.use(morgan("dev"));

// Rutas
app.get("/", (req, res) => {
	res.send("Servidor funcionando correctamente");
});

app.use("/api/access-control", controlRouter);

app.get("/test/users", async (req, res) => {
	const id = Number(req.query.id);
	if (!id || Number.isNaN(id)) {
		return res.status(400).json({
			message: "Query param id is required and must be a number",
		});
	}

	try {
		const user = await getUserModel(id);
		if (!user) return res.status(404).json({ message: "User not found" });
		return res.status(200).json(user);
	} catch (error) {
		console.error("Test route error:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
});

// Montar rutas de access-control
app.use('/api/access-control', controlRouter);

// Ruta de prueba rápida: GET /test/users?id=1
app.get('/test/users', async (req, res) => {
    const id = Number(req.query.id)
    if (!id || Number.isNaN(id)) return res.status(400).json({ message: 'Query param id is required and must be a number' })

    try {
        const user = await getUserModel(id)
        if (!user) return res.status(404).json({ message: 'User not found' })
        return res.status(200).json(user)
    } catch (error) {
        console.error('Test route error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
})

app.use('/api/subjects', subjectRoute)
app.use('/api/prelacies', prelaciesRoute)

// >>> MONTA MANAGEMENT ANTES DEL LISTEN <<<
app.use("/api/management", managementRoute);

// Montamos el servidor
app.listen(SETTINGS.PORT, () => {
	console.log(
		`Servidor escuchando en el puerto http://localhost:${SETTINGS.PORT}`
	);
});
