import { ScrapingStrategy } from './../../../types/types';

export const jaccCardioOncoArticleStrategy: ScrapingStrategy = {
	url: 'https://www.jacc.org/toc/cardio-oncology/0/0',
	evaluate: async (page) => {
		return page.evaluate(() => {
			const items = Array.from(document.querySelectorAll('.search-item'));
			console.log("Nombre d'articles trouvés:", items.length);

			return items.map((item) => {
				const titleElement = item.querySelector('.search-item__title a');
				const authorElements = Array.from(
					item.querySelectorAll('.meta__authors li')
				);
				const detailsElement = item.querySelector('.meta__info');
				const isOpenAccess =
					item.querySelector('.access-icon--open') !== null;

				return {
					title: titleElement?.textContent?.trim() || '',
					authors: authorElements
						.map((author) => author.textContent?.trim())
						.filter(Boolean) as string[],
					publicationDetails: {
						volume:
							detailsElement
								?.querySelector('li:nth-child(3)')
								?.textContent?.trim() || '',
						date:
							detailsElement
								?.querySelector('li:nth-child(2)')
								?.textContent?.trim() || '',
					},
					doi: titleElement?.getAttribute('href') || '',
					url: titleElement?.getAttribute('href')
						? `https://www.jacc.org${titleElement.getAttribute('href')}`
						: '',
					source: 'JACCardioOnco' as const,
					isOpenAccess,
				};
			});
		});
	},
};
