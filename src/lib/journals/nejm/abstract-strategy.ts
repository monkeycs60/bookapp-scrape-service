import { Page } from 'puppeteer';
import { scrapeWithRetry } from './../../scraping/strategies';
import { AbstractSection } from './../../../types/types';

export const nejmAbstractStrategy = async (page: Page, url: string) => {
	await scrapeWithRetry(page, url);
	return page.evaluate(() => {
		const sections: Record<string, AbstractSection> = {};
		let currentIndex = 0;

		const cleanAbstract = (abstract: string | null) => {
			return abstract?.trim().replace(/\s+/g, ' ') || '';
		};

		// Récupérer les auteurs en combinant givenName et familyName
		const authorElements = document.querySelectorAll(
			'.contributors span[property="author"]'
		);
		const authorsText = Array.from(authorElements)
			.map((authorSpan) => {
				const givenName =
					authorSpan.querySelector('span[property="givenName"]')
						?.textContent || '';
				const familyName =
					authorSpan.querySelector('span[property="familyName"]')
						?.textContent || '';
				return cleanAbstract(`${givenName} ${familyName}`);
			})
			.filter(Boolean);

		sections['Authors'] = {
			title: 'Authors',
			text: authorsText.join(', '),
			authors: authorsText,
			index: currentIndex++,
		};

		// Get figure
		const figure = document.querySelector('.graphic img') as HTMLImageElement;
		if (figure) {
			sections['image'] = {
				title: 'image',
				text: figure.src,
				index: currentIndex++,
			};
		}

		// Get keywords
		const keywords = Array.from(
			document.querySelectorAll('.core-classifications .keywords a')
		);

		const keywordsText = keywords
			.map((a) => a.textContent?.trim())
			.filter(Boolean) as string[];

		sections['Keywords'] = {
			title: 'Keywords',
			text: keywordsText.join(', '),
			keywords: keywordsText,
			index: currentIndex++,
		};

		// Get article type
		const originalSourceType = document.querySelector('.meta-panel__type');
		if (originalSourceType) {
			sections['originalSourceType'] = {
				title: 'originalSourceType',
				text: originalSourceType.textContent?.trim() || '',
				index: currentIndex++,
			};
		}

		// Get abstract sections
		document
			.querySelectorAll('#abstracts section[id^="abs-sec-"]')
			.forEach((section) => {
				const titleElement = section.querySelector('h3');
				const contentElement = section.querySelector(
					'div[role="paragraph"]'
				);

				const title = titleElement?.textContent?.trim() || 'Abstract';
				const content = contentElement?.textContent?.trim();

				if (content && !title.toLowerCase().includes('funding')) {
					sections[title] = {
						title,
						text: cleanAbstract(content),
						index: currentIndex++,
					};
				}
			});

		return sections;
	});
};
