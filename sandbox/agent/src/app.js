import express from 'express';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';

const WORKING_DIR = '/workspace';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Hello from Agent!', status: 'success' });
});


/**
 * @route GET /list-files
 * @description Lists all files in the working directory and its subdirectories. Returns a JSON object with the file paths relative to the working directory. exclude directories like node_modules, .git,dist, etc.
 * - eg. {
 *     "files": [
 *         "file1.txt",
 *         "src/file2.txt",
 *         "src/subdir/file3.txt"
 *     ]
 * }
 */
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

/**
 * @route GET /read-file
 * @description Reads the content of the specified files from the working directory. Returns a JSON object with the file paths relative to the working directory and their content.
 * - eg. {
 *     "file1.txt": "Hello, World!",
 *     "src/file2.txt": "Hello, Node.js!"
 * }
 */
app.get("/read-files", async (req, res) => {
    const files = req.query.files;

    if (!files || typeof files !== "string") {
        return res.status(400).json({
            message: 'Invalid request. Expected a "files" query parameter.',
            status: "error"
        });
    }

    const fileList = files
        .split(",")
        .map(file => file.trim())
        .filter(Boolean);

    const results = await Promise.all(
        fileList.map(async (file) => {
            try {
                const filePath = path.resolve(WORKING_DIR, file);

                // Prevent path traversal
                const resolvedWorkingDir = path.resolve(WORKING_DIR);
                if (!filePath.startsWith(resolvedWorkingDir + path.sep)) {
                    throw new Error("Invalid file path");
                }

                const content = await fs.promises.readFile(
                    filePath,
                    "utf8"
                );

                return {
                    [file]: content
                };
            } catch (error) {
                return {
                    [file]: {
                        error: error.message
                    }
                };
            }
        })
    );

    res.status(200).json({
        message: "Files read successfully",
        status: "success",
        files: Object.assign({}, ...results)
    });
});

/**
 * @route PATCH /update-files
 * @description Updates the content of the specified files in the working directory.
 * - eg. {
 *     "updates": [
 *         {
 *             "file": "file1.txt",
 *             "content": "Hello, Node.js!"
 *         },
 *         {
 *             "file": "src/file2.txt",
 *             "content": "Hello, World!"
 *         }
 *     ]
 * }
 */
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

            try {
                const filePath = path.resolve(WORKING_DIR, file);

                // Prevent path traversal
                const resolvedWorkingDir = path.resolve(WORKING_DIR);
                if (!filePath.startsWith(resolvedWorkingDir + path.sep)) {
                    throw new Error("Invalid file path");
                }

                // Ensure file exists before updating and avoid TOCTOU race condition
                const fileHandle = await fs.promises.open(filePath, 'r+');
                await fileHandle.writeFile(content ?? "", "utf8");
                await fileHandle.close();

                return {
                    [file]: "file updated successfully"
                };
            } catch (error) {
                return {
                    [file]: {
                        error: error.message
                    }
                };
            }
        })
    );

    res.status(200).json({
        message: "Files updated successfully",
        status: "success",
        results
    });
});

/**
 * @route POST /create-file
 * @description Creates the specified files in the working directory.
 * - eg. {
 *     "files": [
 *         {
 *             "file": "file1.txt",
 *             "content": "Hello, Node.js!"
 *         },
 *         {
 *             "file": "src/file2.txt",
 *             "content": "Hello, World!"
 *         }
 *     ]
 * }
 */
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

            const filePath = path.resolve(WORKING_DIR, file);
            const directoryPath = path.dirname(filePath);

            try {
                // Prevent path traversal
                const resolvedWorkingDir = path.resolve(WORKING_DIR);
                if (!filePath.startsWith(resolvedWorkingDir + path.sep)) {
                    throw new Error("Invalid file path");
                }

                // Create all missing parent directories
                await fs.promises.mkdir(directoryPath, {
                    recursive: true
                });

                await fs.promises.writeFile(
                    filePath,
                    content || "",
                    "utf8"
                );

                return {
                    [file]: "file created successfully"
                };
            } catch (error) {
                return {
                    [file]: {
                        error: error.message
                    }
                };
            }
        })
    );

    res.status(200).json({
        message: "Files created successfully",
        status: "success",
        results
    });
});

export default app;
