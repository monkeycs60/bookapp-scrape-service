import { Page } from 'puppeteer';
import { scrapeWithRetry } from './../../scraping/strategies';
import { AbstractSection } from './../../../types/types';

export const lancetAbstractStrategy = async (page: Page, url: string) => {
	await scrapeWithRetry(page, url);
	return page.evaluate(() => {
		const sections: Record<string, AbstractSection> = {};
		let currentIndex = 0;

		const cleanAbstract = (abstract: string | null) => {
			return abstract?.trim().replace(/\s+/g, ' ') || '';
		};

		// Récupérer la date
		const date = document.querySelector('.meta-panel__onlineDate');
		if (date) {
			sections['date'] = {
				title: 'date',
				text: date.textContent?.trim() || '',
				index: currentIndex++,
			};
		}
		// Récupérer le doi
		const doi = document.querySelector('.expandable-content .doi a');
		if (doi) {
			sections['doi'] = {
				title: 'doi',
				text: doi.textContent?.trim() || '',
				index: currentIndex++,
			};
		}
		// Récupérer le type d'article
		const originalSourceType = document.querySelector('.meta-panel__type');
		if (originalSourceType) {
			sections['originalSourceType'] = {
				title: 'originalSourceType',
				text: originalSourceType.textContent?.trim() || '',
				index: currentIndex++,
			};
		}

		const figure = ''; // pas de figure

		// Récupérer les auteurs (donner le champ d'un auteur)
		// Sélectionner tous les auteurs
		const authors = document.querySelectorAll('span[property="author"]');

		// Extraire les détails des auteurs
		const authorsDetails = Array.from(authors).map((author) => {
			const givenNameElement = author.querySelector(
				'span[property="givenName"]'
			);
			const givenName = givenNameElement
				? givenNameElement.textContent?.trim() || ''
				: '';

			const familyNameElement = author.querySelector(
				'span[property="familyName"]'
			);
			const familyName = familyNameElement
				? familyNameElement.textContent?.trim() || ''
				: '';

			return `${givenName} ${familyName}`.trim();
		});

		// Filtrer les auteurs valides (éviter les entrées vides)
		const validAuthors = authorsDetails.filter((author) => author.length > 0);

		sections['Authors'] = {
			title: 'Authors',
			text: validAuthors.join(', '),
			authors: validAuthors as string[],
			index: currentIndex++,
		};

		// Récupérer les sections de l'abstract
		document
			.querySelectorAll('#author-abstract section')
			.forEach((section) => {
				const titleElement = section.querySelector('h1, h2, h3');
				const titleText = cleanAbstract(titleElement?.textContent || '');
				const title = titleText || 'Abstract';

				if (
					!title.toLowerCase().includes('funding') &&
					!title.toLowerCase().includes('footnotes') &&
					!title.toLowerCase().includes('references')
				) {
					const paragraphs = Array.from(section.querySelectorAll('div'))
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
