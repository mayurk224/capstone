import express from 'express';
import morgan from 'morgan';
import fs from 'fs';

const WORKING_DIR = '/workspace';

const app = express();

app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Hello from Agent!', status: 'success' });
});

app.get("/list-files", async (req, res) => {
    try {
        const elements = await fs.promises.readdir(WORKING_DIR);
        res.status(200).json({ message: 'Files listed successfully', status: 'success', elements });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to list files', 
            status: 'error', 
            error: error.message 
        });
    }
});

export default app;
