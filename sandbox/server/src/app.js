import express from 'express';
import morgan from 'morgan';
import { v7 as uuid } from "uuid"
import { createService } from './kubernetes/service.js';
import { createPod } from './kubernetes/pod.js';

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/sandbox/health', (req, res) => {
  res.status(200).json({
    message: 'Sandbox is healthy',
    status: 'ok',
  });
});

app.post("/api/sandbox/start", async (req, res) => {

  const sandboxId = uuid();

  await Promise.all([
    createPod(sandboxId),
    createService(sandboxId)
  ]);

  return res.status(201).json({
    message: 'Sandbox environment created successfully',
    sandboxId,
    previewUrl: `http://${sandboxId}.preview.localhost`
  })

})

export default app;
