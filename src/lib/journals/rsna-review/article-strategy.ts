import { ScrapingStrategy } from './../../../types/types';

export const rsnaReviewArticleStrategy: ScrapingStrategy = {
	url: 'https://pubs.rsna.org/topic/subspecialty/ca?SeriesKey=radiology&sortBy=Earliest&startPage=&ContentItemType=review-article',
	evaluate: async (page) => {
		return page.evaluate(() => {
			const items = Array.from(document.querySelectorAll('.search__item'));
			return items.map((item) => {
				const titleElement = item.querySelector('.meta__title a');
				const authorElements = Array.from(
					item.querySelectorAll('.hlFld-ContribAuthor a')
				);
				const detailsElement = item.querySelector('.meta__details');
				const doiElement = item.querySelector('.search-item__doi-link a');

				return {
					title: titleElement?.textContent?.trim() || '',
					authors: authorElements
						.map((author) => author.textContent?.trim())
						.filter(Boolean) as string[],
					publicationDetails: {
						volume:
							detailsElement
								?.querySelector('.meta__volume')
								?.textContent?.trim() || '',
						date:
							detailsElement
								?.querySelector('.meta__epubDate')
								?.textContent?.trim() || '',
					},
					doi: doiElement?.textContent?.trim() || '',
					url: titleElement?.getAttribute('href')
						? `https://pubs.rsna.org${titleElement.getAttribute('href')}`
						: '',
					source: 'RSNAReview' as const,
				};
			});
		});
	},
};
