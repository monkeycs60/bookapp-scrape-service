import { ScrapingStrategy } from './../../../types/types';

export const jmriArticleStrategy: ScrapingStrategy = {
	url: 'https://onlinelibrary.wiley.com/toc/15222586/0/0',
	evaluate: async (page) => {
		return page.evaluate(() => {
			const items = Array.from(document.querySelectorAll('.issue-item'));
			console.log("Nombre d'articles trouvés:", items.length);

			return items.map((item) => {
				const titleElement = item.querySelector('a h2');
				const authorElements = Array.from(
					item.querySelectorAll(
						'.comma__list .comma__item a .author-style'
					)
				);
				const isOpenAccess = true; // Pas trouvé pour le moment
				const doiElement = item.querySelector('.doi-url');

				return {
					title: titleElement?.textContent?.trim() || '',
					authors: authorElements
						.map((author) => author.textContent?.trim())
						.filter(Boolean) as string[],
					publicationDetails: {
						volume: '',
						date: '',
					},
					doi: doiElement?.textContent?.trim() || '',
					url: titleElement?.getAttribute('href')
						? `https://onlinelibrary.wiley.com${titleElement.getAttribute(
								'href'
						  )}`
						: '',
					source: 'JMRI' as const,
					isOpenAccess,
				};
			});
		});
	},
};
