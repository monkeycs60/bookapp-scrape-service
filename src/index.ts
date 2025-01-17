// src/index.ts
import express from 'express';
import cors from 'cors';
import { loadConfig } from './config';
import { createScraper } from './scraper';
import { Source, SOURCES } from './types/types';
import * as dotenv from 'dotenv';

dotenv.config();

console.log('Environment variables:', process.env);
const config = loadConfig();
console.log('Config:', config);
const app = express();

// Middleware
app.use(express.json());
// app.use(
// 	cors({
// 		origin: config.ALLOWED_ORIGINS,
// 		methods: ['POST'],
// 	})
// );

// Middleware d'authentification
const authenticateRequest = (
	req: express.Request,
	res: express.Response,
	next: express.NextFunction
) => {
	const apiKey = req.headers['x-api-key'];

	if (!apiKey || apiKey !== config.API_KEY) {
		return res.status(401).json({ error: 'Unauthorized' });
	}

	next();
};

// Initialisation du scraper
const scraper = createScraper({
	proxyConfig: {
		username: config.PROXY_USERNAME,
		password: config.PROXY_PASSWORD,
		host: config.PROXY_HOST,
		port: config.PROXY_PORT,
	},
	recaptchaApiKey: config.RECAPTCHA_API_KEY,
	mainAppConfig: {
		url: config.MAIN_APP_URL,
		apiKey: config.MAIN_APP_API_KEY,
	},
});

app.get('/', (req, res) => {
	res.send('Hello World from Serizay');
});

// Route pour scraper une source spécifique
app.post('/api/scrape', authenticateRequest, async (req, res) => {
	try {
		const { source } = req.body as { source: Source };

		if (!SOURCES.includes(source)) {
			return res.status(400).json({ error: 'Invalid source' });
		}

		const articles = await scraper.scrapeSource(source);
		res.json({ success: true, articles });
	} catch (error) {
		console.error('Scraping error:', error);
		res.status(500).json({
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
});

// Route pour scraper toutes les sources
app.post('/api/scrape-all', authenticateRequest, async (req, res) => {
	try {
		const results = [];

		for (const source of SOURCES) {
			try {
				console.log(`Scraping ${source}...`);
				const articles = await scraper.scrapeSource(source);
				results.push({ source, articles, success: true });
			} catch (error) {
				console.error(`Error scraping ${source}:`, error);
				results.push({
					source,
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error',
				});
			}
			// Délai entre chaque source
			await new Promise((r) => setTimeout(r, 5000));
		}

		res.json({ success: true, results });
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
});

// Gestion du nettoyage à l'arrêt
process.on('SIGTERM', async () => {
	console.log('SIGTERM signal received. Cleaning up...');
	await scraper.cleanup();
	process.exit(0);
});

const PORT = config.PORT;
app.listen(PORT, () => {
	console.log(`Scraping worker running on port ${PORT}`);
});
