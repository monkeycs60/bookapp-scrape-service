import { ScrapingStrategy } from './../../../types/types';

export const jcmrArticleStrategy: ScrapingStrategy = {
	url: 'https://www.journalofcmr.com/inpress',
	evaluate: async (page) => {
		return page.evaluate(() => {
			const items = Array.from(
				document.querySelectorAll('.toc__item__body')
			);
			console.log("Nombre d'articles trouvés:", items.length);

			return items.map((item) => {
				const titleElement = item.querySelector('.toc__item__body h3 a');
				const authorElements = Array.from(
					item.querySelectorAll('.toc__item__authors li')
				);
				const isOpenAccess = true; // Journal en open access

				return {
					title: titleElement?.textContent?.trim() || '',
					authors: authorElements
						.map((author) => author.textContent?.trim())
						.filter(Boolean) as string[],
					publicationDetails: {
						volume: '',
						date: '',
					},
					doi: titleElement?.getAttribute('href') || '',
					url: titleElement?.getAttribute('href')
						? `https://www.journalofcmr.com${titleElement.getAttribute(
								'href'
						  )}`
						: '',
					source: 'JCMR' as const,
					isOpenAccess,
				};
			});
		});
	},
};
