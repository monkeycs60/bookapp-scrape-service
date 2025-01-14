import { ScrapingStrategy } from './../../../types/types';

export const lancetArticleStrategy: ScrapingStrategy = {
	url: 'https://www.thelancet.com/journals/lancet/onlinefirst',
	evaluate: async (page) => {
		return page.evaluate(() => {
			const items = Array.from(
				document.querySelectorAll('.toc__section .aop__toc')
			);
			return items.map((item) => {
				const titleElement = item.querySelector('h3 a');
				const authorElements = Array.from(
					item.querySelectorAll('.loa__item')
				);
				const isOpenAccess =
					item.querySelector('.toc__item__access') !== null;

				return {
					title: titleElement?.textContent?.trim() || '',
					authors: authorElements
						.map((author) => author.textContent?.trim())
						.filter(Boolean) as string[],
					publicationDetails: {
						volume: '',
						date: '',
					},
					doi: '', // No DOI available
					url: titleElement?.getAttribute('href')
						? `https://www.thelancet.com${titleElement.getAttribute(
								'href'
						  )}`
						: '',
					source: 'LANCET' as const,
					isOpenAccess,
				};
			});
		});
	},
};
