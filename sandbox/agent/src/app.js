import express from 'express';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';

const WORKING_DIR = '/workspace';

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Hello from Agent!', status: 'success' });
});

app.get("/list-files", async (req, res) => {
    const listFiles = async (dir, baseDir) => {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        const files = [];
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(baseDir, fullPath);
            if (entry.isDirectory() && ["node_modules", ".git", "dist"].includes(entry.name)) {
                continue;
            }
            if (entry.isDirectory()) {
                files.push(...await listFiles(fullPath, baseDir));
            } else {
                files.push(relativePath);
            }
        }
        return files;
    };
    try {
        const files = await listFiles(WORKING_DIR, WORKING_DIR);
        res.status(200).json({
            message: 'Files listed successfully',
            status: 'success',
            files
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to list files',
            status: 'error',
            error: error.message
        });
    }
});

app.get("/read-files", async (req, res) => {
    const files = req.query.files;

    if (!files) {
        return res.status(400).json({
            message: 'No files specified.',
            status: "error"
        });
    }

    const fileList = files
        .split(",");

    const results = await Promise.all(
        fileList.map(async (file) => {
            const filePath = path.join(WORKING_DIR, file);
            try {

                const content = await fs.promises.readFile(
                    filePath,
                    "utf8"
                );

                return {
                    [filePath.replace(WORKING_DIR, '')]: content,
                }
            } catch (error) {
                return {
                    [filePath.replace(WORKING_DIR, '')]: `Error reading file: ${error.message}`,
                }

            }
        })
    );

    res.status(200).json({
        message: "Files read successfully",
        status: "success",
        files: results
    });
});

app.patch("/update-files", async (req, res) => {
    const updates = req.body.updates;

    if (!updates || !Array.isArray(updates)) {
        return res.status(400).json({
            message: 'Invalid request body. Expected an "updates" array.',
            status: 'error'
        });
    }

    const results = await Promise.all(
        updates.map(async (update) => {
            const { file, content } = update;

            const filePath = path.join(WORKING_DIR, file);
            try {
                console.log(path.dirname(filePath), filePath);
                //                 // Ensure file exists before updating and avoid TOCTOU race condition
                await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
                await fs.promises.writeFile(filePath, content, 'utf-8');
                return {
                    [filePath]: 'File updated successfully',
                }
            } catch (error) {
                return {
                    [filePath]: `Error updating file: ${error.message}`,
                }

            }
        })
    );

    res.status(200).json({
        message: "Files updated successfully",
        status: "success",
        results
    });
});

app.post("/create-files", async (req, res) => {
    const files = req.body.files;

    if (!files || !Array.isArray(files)) {
        return res.status(400).json({
            message: 'Invalid request body. Expected a JSON object with a "files" property containing an array of file objects.',
            status: 'error'
        });
    }

    const results = await Promise.all(
        files.map(async (fileObj) => {
            const { file, content } = fileObj;

            const filePath = path.join(WORKING_DIR, file);

            try {

                //                 // Create all missing parent directories
                await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

                await fs.promises.writeFile(filePath, content, 'utf-8');

                return {
                    [filePath]: 'File created successfully',
                }
            } catch (error) {
                return {
                    [filePath]: `Error creating file: ${error.message}`,
                }

            }
        })
    );

    res.status(200).json({
        message: 'File creation results',
        results,
    });
});

export default app;
