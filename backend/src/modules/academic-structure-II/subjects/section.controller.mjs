import { validateSection, validateUpdateSection } from "./section.schema.mjs";

// Controlador que maneja las solicitudes relacionadas con las secciones académicas
export class SectionController {
    constructor({ ModelSection }) {
        this.ModelSection = ModelSection;
    }

    // Controlador para obtener todas las secciones académicas
    getAllSections = async (req, res) => {
        try {
            const result = await this.ModelSection.getAllSections();
            if (result.error) return res.status(404).json({ error: result.error });
            return res.status(200).json({
                message: result.message,
                sections: result.sections
            });
        }
        catch (error) {
            return res.status(500).json({ error: 'Error del servidor' });
        }
    }

    // Controlador para obtener secciones por grado
    getSectionsByGrade = async (req, res) => {
        const { gradeId } = req.params;
        try {
            const result = await this.ModelSection.getSectionsByGrade(Number(gradeId));
            if (result.error) return res.status(404).json({ error: result.error });
            return res.status(200).json({
                message: result.message,
                sections: result.sections
            });
        }
        catch (error) {
            return res.status(500).json({ error: 'Error del servidor' });
        }
    }

    // Controlador para obtener una sección académica por su ID
    getSectionById = async (req, res) => {
        const { sectionId } = req.params;
        try {
            const result = await this.ModelSection.getSectionById(Number(sectionId));
            if (result.error) return res.status(404).json({ error: result.error });
            return res.status(200).json({
                message: result.message,
                section: result.section
            });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error del servidor' });
        }
    }

    // Controlador para crear una nueva sección académica
    createSection = async (req, res) => {
        const validation = validateSection(req.body);
        try {
            if (!validation.success) {
                return res.status(400).json({
                    error: 'Datos inválidos para crear la sección',
                    details: validation.error
                });
            }
            const result = await this.ModelSection.createSection(validation.data);
            if (result.error) return res.status(400).json({ error: result.error });
            return res.status(201).json({
                message: result.message,
                section: result.section
            });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error del servidor' });
        }
    }

    // Controlador para actualizar una sección académica
    updateSection = async (req, res) => {
        const { sectionId } = req.params;
        const validation = validateUpdateSection(req.body);
        try {
            if (!validation.success) {
                return res.status(400).json({
                    error: 'Datos inválidos para actualizar la sección',
                    details: validation.error
                });
            }
            const result = await this.ModelSection.updateSection(Number(sectionId), validation.data);
            if (result.error) return res.status(400).json({ error: result.error });
            return res.status(200).json({
                message: result.message,
                section: result.section
            });
        }
        catch (error) {
            return res.status(500).json({ error: 'Error del servidor' });
        }
    }

    // Controlador para eliminar una sección académica
    deleteSection = async (req, res) => {
        const { sectionId } = req.params;
        try {
            const result = await this.ModelSection.deleteSection(Number(sectionId));
            if (result.error) return res.status(400).json({ error: result.error });
            return res.status(200).json({
                message: result.message
            });
        }
        catch (error) {
            return res.status(500).json({ error: 'Error del servidor' });
        }
    }
}