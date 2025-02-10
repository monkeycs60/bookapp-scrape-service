// src/index.ts
import express from 'express';
import cors from 'cors';
import { loadConfig } from './config';
import * as dotenv from 'dotenv';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createDeepSeek } from '@ai-sdk/deepseek';
import prisma from './lib/prisma';
import { processSingleSource, processAllSources } from './services/scrape';
import { ScrapingContext } from './lib/scraping/types';
import { Browser } from 'puppeteer';

dotenv.config();

console.log('Environment variables:', process.env);
const config = loadConfig();
console.log('Config:', config);
const app = express();

// Middleware
app.use(express.json());
app.use(
	cors({
		origin: config.ALLOWED_ORIGINS,
		methods: ['POST', 'GET'],
	})
);

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

puppeteer.use(StealthPlugin());
puppeteer.use(
	RecaptchaPlugin({
		provider: {
			id: '2captcha',
			token: process.env.CAPTCHA_API_KEY,
		},
		visualFeedback: true,
		throwOnError: true,
	})
);

// Initialisation du scraper
// const scraper = createScraper({
// 	proxyConfig: {
// 		username: config.PROXY_USERNAME,
// 		password: config.PROXY_PASSWORD,
// 		host: config.PROXY_HOST,
// 		port: config.PROXY_PORT,
// 	},
// 	recaptchaApiKey: config.RECAPTCHA_API_KEY,
// 	mainAppConfig: {
// 		url: config.MAIN_APP_URL,
// 		apiKey: config.MAIN_APP_API_KEY,
// 	},
// });

app.get('/', (req, res) => {
	res.send('Hello World from Serizay');
});

// Route pour scraper toutes les sources
app.post('/api/scrape-all', authenticateRequest, async (req, res) => {
	console.log('Scraping all sources... on digital ocean');

	let browser: Browser | undefined;

	try {
		const { sourceId } = req.body;

		browser = await puppeteer.launch({
			headless: false,
			args: [
				`--proxy-server=http://${config.PROXY_HOST}:${config.PROXY_PORT}`,
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-infobars',
				'--disable-dev-shm-usage',
				'--disable-blink-features=AutomationControlled',
				'--disable-web-security',
				'--disable-features=IsolateOrigins,site-per-process',
				'--window-size=1920,1080',
			],
			defaultViewport: {
				width: 1920,
				height: 1080,
			},
		});

		const context: ScrapingContext = {
			prisma,
			browser,
			google: createGoogleGenerativeAI({
				apiKey: config.GOOGLE_GEMINI_API_KEY,
			}),
			deepseek: createDeepSeek({
				apiKey: config.DEEPSEEK_API_KEY,
			}),
		};

		if (sourceId) {
			const result = await processSingleSource(context, sourceId);
			return res.status(200).json(result);
		} else {
			const results = await processAllSources(context);
			return res.status(200).json({ success: true, results });
		}
	} catch (error) {
		console.error('Error:', error);
		return res
			.status(500)
			.json({ success: false, message: 'Internal server error' });
	} finally {
		if (browser) {
			await browser.close();
		}
	}
});

const PORT = config.PORT;
app.listen(PORT, () => {
	console.log(`Scraping worker running on port ${PORT}`);
});
