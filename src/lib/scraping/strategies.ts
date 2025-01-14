import { Browser, Page } from 'puppeteer';

export const scrapingCredentials = {
	username: process.env.PROXY_USERNAME,
	password: process.env.PROXY_PASSWORD,
	host: process.env.PROXY_HOST,
	port: process.env.PROXY_PORT,
};

export const throwErrorOnMissingCredentials = () => {
	if (
		!scrapingCredentials.username ||
		!scrapingCredentials.password ||
		!scrapingCredentials.host ||
		!scrapingCredentials.port
	) {
		throw new Error('Proxy credentials are not set');
	}
};

export async function setupScrapingPage(browser: Browser) {
	throwErrorOnMissingCredentials();
	const page = await browser.newPage();

	await page.authenticate({
		username: scrapingCredentials.username!,
		password: scrapingCredentials.password!,
	});

	await page.setExtraHTTPHeaders({
		'Accept-Language': 'en-US,en;q=0.9',
		Accept:
			'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
		'User-Agent':
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
		'Upgrade-Insecure-Requests': '1',
		Connection: 'keep-alive',
		'Cache-Control': 'max-age=0',
	});

	return page;
}

export async function handlePageLoad(page: Page, source: string) {
	try {
		await page.solveRecaptchas();
		console.log('Recaptcha résolu');
	} catch (error) {
		console.log('Pas de recaptcha trouvé ou erreur:', error);
	}

	await page.screenshot({ path: `screenshot${source}.png` });
	await new Promise((resolve) => setTimeout(resolve, 3000));

	const content = await page.content();
	if (content.includes('cf-challenge') || content.includes('Just a moment')) {
		console.log(
			'Détection du challenge Cloudflare, tentative de résolution...'
		);
		await page.solveRecaptchas();
		console.log('Recaptcha résolu encore une fois');
	}

	const pageHtml = await page.content();
	console.log(`HTML complet de la page ${source}:`, pageHtml);
}

export async function handleScrapingError(
	page: Page,
	source: string,
	error: unknown
): Promise<never> {
	try {
		const errorPageHtml = await page.content();
		console.log(`HTML de la page d'erreur ${source}:`, errorPageHtml);
	} catch (e) {
		console.log("Impossible de récupérer le HTML de la page d'erreur:", e);
	}
	await page.close();
	throw error;
}

export async function scrapeWithRetry(page: Page, url: string, maxRetries = 4) {
	for (let i = 0; i < maxRetries; i++) {
		try {
			await page.goto(url, {
				waitUntil: 'networkidle0',
				timeout: 120000,
			});

			// Attendre un peu avant de vérifier le contenu
			await new Promise((r) => setTimeout(r, 5000));

			const content = await page.content();
			if (
				content.includes('cf-challenge') ||
				content.includes('Just a moment')
			) {
				console.log('Détection Cloudflare, tentative de résolution...');

				// Attendre que le captcha soit chargé
				await page
					.waitForSelector('#challenge-form', { timeout: 10000 })
					.catch(() => { });

				try {
					await page.solveRecaptchas();
					console.log('Recaptcha résolu, attente de la navigation...');

					// Attendre la navigation après la résolution du captcha
					await Promise.race([
						page.waitForNavigation({
							waitUntil: 'networkidle0',
							timeout: 30000,
						}),
						new Promise((r) => setTimeout(r, 30000)),
					]);

					// Vérifier à nouveau le contenu
					const newContent = await page.content();
					if (
						!newContent.includes('cf-challenge') &&
						!newContent.includes('Just a moment')
					) {
						console.log(
							'Page chargée avec succès après résolution du captcha'
						);
						return;
					}
				} catch (captchaError) {
					console.error(
						'Erreur lors de la résolution du captcha:',
						captchaError
					);
				}
			} else {
				console.log('Page chargée sans captcha');
				return;
			}

			console.log(
				`Tentative ${i + 1}/${maxRetries} échouée, attente avant retry...`
			);
			// Augmenter le délai entre les tentatives
			await new Promise((r) => setTimeout(r, Math.pow(2, i + 1) * 5000));
		} catch (error) {
			if (i === maxRetries - 1) throw error;
			console.log(
				`Erreur lors de la tentative ${i + 1}/${maxRetries}:`,
				error
			);
			await new Promise((r) => setTimeout(r, Math.pow(2, i + 1) * 5000));
		}
	}
	throw new Error('Nombre maximum de tentatives atteint');
}
