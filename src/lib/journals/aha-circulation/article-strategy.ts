import { ScrapingStrategy } from './../../../types/types';

export const ahaCirculationArticleStrategy: ScrapingStrategy = {
	url: 'https://www.ahajournals.org/toc/circ/0/0',
	evaluate: async (page) => {
		return page.evaluate(() => {
			const items = Array.from(document.querySelectorAll('.toc__section'));
			console.log("Nombre d'articles trouvés:", items.length);

			return items.map((item) => {
				const titleElement = item.querySelector('h2 a');
				const authorElements = Array.from(
					item.querySelectorAll('.list-inline-item a')
				).filter((author) => !author.textContent?.includes('[...]'));

				const dateElement = Array.from(item.querySelectorAll('span')).find(
					(span) => span.textContent?.includes('ORIGINALLY PUBLISHED')
				) as HTMLSpanElement | null;

				const dateElementCleaned =
					dateElement?.textContent
						?.replace('ORIGINALLY PUBLISHED', '')
						.trim() || '';

				console.log({ dateElementCleaned });

				const isOpenAccess =
					item.querySelector('.access-icon--open') !== null;

				const originalSourceType = item.querySelector('.card-category');

				return {
					title: titleElement?.textContent?.trim() || '',
					authors: authorElements
						.map((author) => author.textContent?.trim())
						.filter(Boolean) as string[],
					publicationDetails: {
						volume: '',
						date: dateElementCleaned || '',
					},
					doi: titleElement?.getAttribute('href') || '',
					url: titleElement?.getAttribute('href')
						? `https://www.ahajournals.org${titleElement.getAttribute(
								'href'
						  )}`
						: '',
					source: 'AHACirculation' as const,
					isOpenAccess,
					originalSourceType:
						originalSourceType?.textContent?.trim() || '',
				};
			});
		});
	},
};
