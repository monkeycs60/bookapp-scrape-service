import { Page } from 'puppeteer';
import { scrapeWithRetry } from './../../scraping/strategies';
import { AbstractSection } from './../../../types/types';

export const jaccBasicTranslationalAbstractStrategy = async (
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

		// Récupérer la date
		const date = document.querySelector('.epub-section__date');
		if (date) {
			sections['date'] = {
				title: 'date',
				text: date.textContent?.trim() || '',
				index: currentIndex++,
			};
		}

		// Récupérer les mots-clés
		const keywords = Array.from(
			document.querySelectorAll('.article__keyword li')
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

		// Récupérer le type d'article
		const originalSourceType = document.querySelector('.article__tocHeading');
		if (originalSourceType) {
			sections['originalSourceType'] = {
				title: 'originalSourceType',
				text: originalSourceType.textContent?.trim() || '',
				index: currentIndex++,
			};
		}

		const figure = document.querySelectorAll(
			'.hlFld-Abstract  .figure__image'
		)[0] as HTMLImageElement;
		if (figure) {
			sections['image'] = {
				title: 'image',
				text: figure.src || '',
				index: currentIndex++,
			};
		}

		// Récupérer les auteurs
		const allAuthors = Array.from(
			document.querySelectorAll('.citation .author-name span')
		);
		const authorsText = allAuthors
			.map((author) => author.textContent?.trim())
			.filter(Boolean) as string[];

		sections['Authors'] = {
			title: 'Authors',
			text: authorsText.join(', '),
			authors: authorsText,
			index: currentIndex++,
		};

		// Récupérer les sections de l'abstract
		document
			.querySelectorAll(
				'.article-section__abstract .article-section__content div'
			)
			.forEach((section) => {
				const titleElement = section.querySelector('h1, h2, h3');
				const titleText = cleanAbstract(titleElement?.textContent || '');
				const title = titleText || 'Abstract';

				if (
					!title.toLowerCase().includes('funding') &&
					!title.toLowerCase().includes('footnotes') &&
					!title.toLowerCase().includes('references')
				) {
					const paragraphs = Array.from(section.querySelectorAll('p'))
						.filter((p) => !p.closest('.article__references'))
						.map((p) => cleanAbstract(p.textContent))
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
