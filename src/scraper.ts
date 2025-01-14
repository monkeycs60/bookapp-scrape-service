import puppeteer from 'puppeteer-extra';
import type { Browser, Page } from 'puppeteer';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';
import {
	Source,
	ScrapedArticle,
	SOURCES_TYPES,
	AbstractData,
} from './types/types';
import { getArticleStrategy } from './lib/scraping/article-strategies';
import { getAbstractStrategy } from './lib/scraping/abstract-strategies';

type ScraperConfig = {
	proxyConfig: {
		username: string;
		password: string;
		host: string;
		port: string;
	};
	recaptchaApiKey: string;
	mainAppConfig: {
		url: string;
		apiKey: string;
	};
};

// Configuration de base de Puppeteer
const setupPuppeteer = (config: ScraperConfig) => {
	puppeteer.use(StealthPlugin());
	puppeteer.use(
		RecaptchaPlugin({
			provider: {
				id: '2captcha',
				token: config.recaptchaApiKey,
			},
			visualFeedback: true,
		})
	);
};

// Initialisation du navigateur
const initBrowser = async (config: ScraperConfig): Promise<Browser> => {
	const { username, password, host, port } = config.proxyConfig;

	return puppeteer.launch({
		executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
		headless: true,
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage',
			`--proxy-server=http://${host}:${port}`,
			'--disable-infobars',
			'--disable-blink-features=AutomationControlled',
			'--window-size=1920,1080',
		],
		defaultViewport: {
			width: 1920,
			height: 1080,
		},
	});
};

// Configuration d'une nouvelle page
const setupPage = async (
	browser: Browser,
	config: ScraperConfig
): Promise<Page> => {
	const { username, password } = config.proxyConfig;
	const page = await browser.newPage();

	await page.authenticate({
		username,
		password,
	});

	return page;
};

// Sauvegarde d'un article via l'API principale
const saveArticle = async (
	article: ScrapedArticle,
	config: ScraperConfig
): Promise<any> => {
	try {
		const response = await fetch(`${config.mainAppConfig.url}/api/articles`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': config.mainAppConfig.apiKey,
			},
			body: JSON.stringify(article),
		});

		if (!response.ok) {
			throw new Error(`Failed to save article: ${response.statusText}`);
		}

		return response.json();
	} catch (error) {
		console.error('Error saving article:', error);
		throw error;
	}
};

// Détermine le type de source de l'article
const determineSourceType = (originalType: string | undefined): string => {
	if (!originalType) return SOURCES_TYPES[0];

	const type = originalType.toLowerCase();
	const typeMap: Record<string, string[]> = {
		[SOURCES_TYPES[0]]: [
			'original research',
			'data report',
			'original article',
			'article',
		],
		[SOURCES_TYPES[1]]: [
			'research letter',
			'brief report',
			'letter',
			'short report',
		],
		[SOURCES_TYPES[2]]: [
			'review',
			'review article',
			'state-of-the-art review',
		],
		[SOURCES_TYPES[3]]: ['editorial', 'expert panel', 'images in'],
		[SOURCES_TYPES[4]]: ['recommendations', 'recommendation', 'guideline'],
	};

	for (const [sourceType, aliases] of Object.entries(typeMap)) {
		if (aliases.some((alias) => type.includes(alias))) {
			return sourceType;
		}
	}

	return SOURCES_TYPES[0];
};

// Traitement d'un article
const processArticle = async (
	browser: Browser,
	article: ScrapedArticle,
	source: Source,
	config: ScraperConfig
): Promise<ScrapedArticle> => {
	const page = await setupPage(browser, config);

	try {
		if (!article.url) {
			throw new Error('Article URL is missing');
		}

		const abstractStrategy = getAbstractStrategy(source);
		const abstractData = await abstractStrategy(page, article.url);

		return {
			...article,
			abstract: abstractData
				? (Object.fromEntries(
						Object.entries(abstractData).map(([k, v]) => [
							k,
							typeof v === 'string'
								? v
								: {
										text: v.text || '',
										title: '',
										index: 0,
								  },
						])
				  ) as unknown as AbstractData)
				: undefined,
			keywords: abstractData?.Keywords?.keywords || [],
			image: abstractData?.image?.text ? [abstractData.image.text] : [],
			sourceType: determineSourceType(
				abstractData?.originalSourceType?.text
			),
		};
	} finally {
		await page.close();
	}
};

// Fonction principale de scraping
export const createScraper = (config: ScraperConfig) => {
	let browser: Browser | null = null;
	setupPuppeteer(config);

	const scrapeSource = async (source: Source) => {
		if (!browser) {
			browser = await initBrowser(config);
		}

		const strategy = getArticleStrategy(source);
		if (!strategy) {
			throw new Error(`Strategy not found for source: ${source}`);
		}

		try {
			const page = await setupPage(browser, config);
			await page.goto(strategy.url, { waitUntil: 'networkidle0' });

			const articles = await strategy.evaluate(page);
			await page.close();

			const processedArticles = [];
			for (const article of articles) {
				try {
					const processedArticle = await processArticle(
						browser,
						article,
						source,
						config
					);
					const savedArticle = await saveArticle(processedArticle, config);
					processedArticles.push(savedArticle);

					await new Promise((r) => setTimeout(r, 1000));
				} catch (error) {
					console.error(
						`Error processing article ${article.title}:`,
						error
					);
				}
			}

			return processedArticles;
		} catch (error) {
			throw new Error(
				`Failed to scrape source ${source}: ${
					error instanceof Error ? error.message : 'Unknown error'
				}`
			);
		}
	};

	const cleanup = async () => {
		if (browser) {
			await browser.close();
			browser = null;
		}
	};

	return {
		scrapeSource,
		cleanup,
	};
};
