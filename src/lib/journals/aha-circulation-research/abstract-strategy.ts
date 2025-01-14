import { Page } from 'puppeteer';
import { scrapeWithRetry } from './../../scraping/strategies';
import { AbstractSection } from './../../../types/types';

export const ahaCirculationResearchAbstractStrategy = async (
	page: Page,
	url: string
) => {
	await scrapeWithRetry(page, url);
	return page.evaluate(() => {
		const sections: Record<string, AbstractSection> = {};
		let currentIndex = 0;

		const cleanAbstract = (abstract: string | null) => {
			return abstract?.trim().replace(/\s+/g, ' ') || '';
		};

		const keywords = Array.from(
			document.querySelectorAll('section [property="keywords"] li a')
		);

		const keywordsText = keywords
			.map((li) => li.textContent?.trim())
			.filter(Boolean) as string[];

		sections['Keywords'] = {
			title: 'Keywords',
			text: keywordsText.join(', '),
			keywords: keywordsText,
			index: currentIndex++,
		};

		const abstractH2 = Array.from(document.querySelectorAll('h2')).find(
			(h2) => h2.textContent?.trim() === 'Abstract'
		);

		const summary = abstractH2?.nextElementSibling?.matches(
			'div[role="paragraph"]'
		)
			? abstractH2.nextElementSibling
			: null;

		if (summary) {
			sections['Summary'] = {
				title: 'Summary',
				text: summary.textContent?.trim() || '',
				index: currentIndex++,
			};
		}

		document.querySelectorAll('#abstract section').forEach((section) => {
			const titleElement = section.querySelector('h1, h2, h3');
			const titleText = cleanAbstract(titleElement?.textContent || '');
			const title = titleText || 'Abstract';

			if (
				!title.toLowerCase().includes('funding') &&
				!title.toLowerCase().includes('footnotes') &&
				!title.toLowerCase().includes('references')
			) {
				const paragraphs = Array.from(section.querySelectorAll('div'))
					.filter((div) => !div.closest('.article__references'))
					.map((div) => cleanAbstract(div.textContent))
					.filter(Boolean);

				if (paragraphs.length > 0) {
					sections[title] = {
						title,
						text: paragraphs.join('\n'),
						index: currentIndex++,
					};
				}
			}
		});

		return sections;
	});
};
