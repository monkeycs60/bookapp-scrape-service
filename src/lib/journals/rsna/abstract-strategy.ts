import { Page } from 'puppeteer';
import { scrapeWithRetry } from './../../scraping/strategies';
import { AbstractSection } from './../../../types/types';

export const rsnaAbstractStrategy = async (page: Page, url: string) => {
	await scrapeWithRetry(page, url);
	return page.evaluate(() => {
		const abstractSection = document.querySelector('.abstractSection');
		if (!abstractSection) return null;

		const sections: Record<string, AbstractSection> = {};
		let currentIndex = 0;

		const cleanAbstract = (abstract: string | null) => {
			return abstract?.trim().replace(/\s+/g, ' ') || '';
		};

		// Récupérer l'image
		const abstractFigure = document.querySelector(
			'.figure__image'
		) as HTMLImageElement;
		if (abstractFigure) {
			sections['image'] = {
				title: 'image',
				text: abstractFigure.src,
				index: currentIndex++,
			};
		}

		// Récupérer le type d'article
		const originalSourceType = document.querySelector(
			'.citation__top__item .article__tocHeading'
		);
		if (originalSourceType) {
			sections['originalSourceType'] = {
				title: 'originalSourceType',
				text: originalSourceType.textContent?.trim() || '',
				index: currentIndex++,
			};
		}

		// Récupérer l'abstract initial
		const initialAbstract = document.querySelector('.hlFld-Abstract > p');
		if (initialAbstract) {
			sections['Summary'] = {
				title: 'Summary',
				text: cleanAbstract(initialAbstract.textContent),
				image: abstractFigure?.src || '',
				index: currentIndex++,
			};
		}

		// Récupérer la date
		const date = document.querySelector('.epub-section__date');
		if (date) {
			sections['date'] = {
				title: 'date',
				text: date.textContent?.trim() || '',
				index: currentIndex++,
			};
		}

		// Récupérer les sections de l'abstract
		document
			.querySelectorAll('.abstractSection .article-section__title')
			.forEach((titleElem, index) => {
				const title = titleElem.textContent?.trim();
				if (!title) return;

				if (
					!title.toLowerCase().includes('funding') &&
					!title.toLowerCase().includes('footnotes') &&
					!title.toLowerCase().includes('references')
				) {
					const contentElem = titleElem.parentElement?.querySelector('p');
					const content = contentElem?.textContent?.trim();
					const cleanedContent = cleanAbstract(content || '');

					if (content) {
						sections[title] = {
							title,
							text: cleanedContent,
							index: index + 1,
						};
					}
				}
			});

		return sections;
	});
};
