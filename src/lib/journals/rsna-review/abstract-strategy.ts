import { Page } from 'puppeteer';
import { scrapeWithRetry } from './../../scraping/strategies';
import { AbstractSection } from './../../../types/types';

export const rsnaReviewAbstractStrategy = async (page: Page, url: string) => {
	await scrapeWithRetry(page, url);
	return page.evaluate(() => {
		const abstractSection = document.querySelector('.abstractSection');
		if (!abstractSection) return null;

		const sections: Record<string, AbstractSection> = {};
		let currentIndex = 0;

		const cleanAbstract = (abstract: string | null) => {
			return abstract?.trim().replace(/\s+/g, ' ') || '';
		};

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

		// Récupérer la date
		const date = document.querySelector('.epub-section__date');
		if (date) {
			sections['date'] = {
				title: 'date',
				text: date.textContent?.trim() || '',
				index: currentIndex++,
			};
		}

		const initialAbstract = document.querySelector('.hlFld-Abstract > p');
		if (initialAbstract) {
			sections['Summary'] = {
				title: 'Summary',
				text: cleanAbstract(initialAbstract.textContent),
				image: abstractFigure?.src || '',
				index: currentIndex++,
			};
		}

		const fullAbstract = document.querySelector('.abstractInFull p');
		if (fullAbstract) {
			sections['Abstract'] = {
				title: 'Abstract',
				text: cleanAbstract(fullAbstract.textContent),
				index: currentIndex++,
			};
		}

		return sections;
	});
};
