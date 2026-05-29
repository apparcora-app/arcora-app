import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { processExtractionDirect } from './jobs/processExtractionJob';
import { sendPushReminders } from './jobs/sendPushReminders';

dotenv.config();

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors({ origin: true }));

const hasValidJobSecret = () => Boolean(process.env.PUSH_JOB_SECRET);

const authorizeJobRequest: express.RequestHandler = (req, res, next) => {
  if (!hasValidJobSecret()) {
    console.error('PUSH_JOB_SECRET is not configured. Refusing to run push reminder jobs.');
    res.status(503).json({ error: 'Push reminder job secret is not configured' });
    return;
  }

  const providedSecret = req.header('x-arcora-job-secret');
  if (providedSecret !== process.env.PUSH_JOB_SECRET) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
};

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.post('/jobs/send-push-reminders', authorizeJobRequest, async (req, res) => {
  try {
    const summary = await sendPushReminders();
    res.status(200).json({ summary });
    console.log('Finished push reminder job.', summary);
  } catch (error: any) {
    console.error('Error sending push reminders:', error);
    res.status(500).json({ error: error.message || 'Push reminder job failed' });
  }
});

app.post('/process', async (req, res) => {
  const { fileName, mimeType, fileBase64 } = req.body;
  
  if (!fileBase64) {
    return res.status(400).json({ error: 'fileBase64 is required' });
  }

  try {
    const buffer = Buffer.from(fileBase64, 'base64');
    const result = await processExtractionDirect(buffer, fileName, mimeType);
    
    res.status(200).json({ result });
    console.log(`Successfully processed direct extraction job for: ${fileName}`);
  } catch (error: any) {
    console.error(`Error processing direct extraction:`, error);
    res.status(500).json({ error: error.message || 'Server extraction error' });
  }
});



const PORT = parseInt(process.env.PORT || '8080', 10);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Cloud Run worker listening on 0.0.0.0:${PORT}`);
});
