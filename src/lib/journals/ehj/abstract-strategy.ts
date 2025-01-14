import { Page } from 'puppeteer';
import { scrapeWithRetry } from './../../scraping/strategies';
import { AbstractSection } from './../../../types/types';

export const ehjAbstractStrategy = async (page: Page, url: string) => {
	await scrapeWithRetry(page, url);
	return page.evaluate(() => {
		const sections: Record<string, AbstractSection> = {};
		let currentIndex = 0;

		// const cleanAbstract = (abstract: string | null) => {
		//     return abstract?.trim().replace(/\s+/g, ' ') || '';
		// };

		// Récupérer les mots-clés
		const keywords = Array.from(document.querySelectorAll('.kwd-group a'));
		const keywordsText = keywords
			.map((li) => li.textContent?.trim())
			.filter(Boolean) as string[];

		sections['Keywords'] = {
			title: 'Keywords',
			text: keywordsText.join(', '),
			keywords: keywordsText,
			index: currentIndex++,
		};

		// Récupérer le type d'article
		const originalSourceType = document.querySelector(
			'.journal-info__format-label'
		);
		if (originalSourceType) {
			sections['originalSourceType'] = {
				title: 'originalSourceType',
				text: originalSourceType.textContent?.trim() || '',
				index: currentIndex++,
			};
		}

		// Récupérer l'image
		const abstractFigure = document.querySelector(
			'.graphic-wrap img'
		) as HTMLImageElement;
		if (abstractFigure) {
			sections['image'] = {
				title: 'image',
				text: abstractFigure.src,
				index: currentIndex++,
			};
		}

		// Récupérer les auteurs
		const allAuthors = Array.from(
			document.querySelectorAll('.al-authors-list span button')
		);
		const authorsText = allAuthors
			.map((li) => li.textContent?.trim())
			.filter(Boolean) as string[];

		sections['Authors'] = {
			title: 'Authors',
			text: authorsText.join(', '),
			authors: authorsText,
			index: currentIndex++,
		};

		// Récupérer les sections de l'abstract
		document.querySelectorAll('.abstract .sec').forEach((section) => {
			const titleElement = section.querySelector('.title');
			const contentElement = section.querySelector('.chapter-para');

			const title = titleElement?.textContent?.trim() || 'Abstract';
			const content = contentElement?.textContent?.trim();

			if (
				content &&
				!title.toLowerCase().includes('funding') &&
				!title.toLowerCase().includes('footnotes') &&
				!title.toLowerCase().includes('references')
			) {
				sections[title] = {
					title,
					text: content,
					index: currentIndex++,
				};
			}
		});

		// Si pas de sections, récupérer l'abstract complet
		if (Object.keys(sections).length === 0) {
			const fullAbstract = document.querySelector('.abstract-content');
			if (fullAbstract) {
				sections['Abstract'] = {
					title: 'Abstract',
					text: fullAbstract.textContent?.trim() || '',
					index: currentIndex++,
				};
			}
		}

		return sections;
	});
};
