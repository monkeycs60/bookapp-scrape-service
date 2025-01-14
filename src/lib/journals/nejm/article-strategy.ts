import { ScrapingStrategy } from './../../../types/types';

export const nejmArticleStrategy: ScrapingStrategy = {
	url: 'https://www.nejm.org/browse/specialty/cardiology?startPage=1&sortBy=pubdate-descending&isFiltered=true&isFilterOpen=true&topic=14_1&articleCategory=research',
	evaluate: async (page) => {
		return page.evaluate(() => {
			const items = Array.from(
				document.querySelectorAll('.os-search-results_list-item')
			);
			console.log("Nombre d'articles trouvés:", items.length);

			return items.map((item) => {
				const titleElement = item.querySelector('.issue-item_title-link');

				const authorElements = Array.from(
					item.querySelectorAll('.issue-item_authors')
				);
				const dateElement = item.querySelector('.issue-item_date');
				const dateText = dateElement?.textContent || '';

				const doiElement = item.querySelector('.issue-item_title-link a');
				const isOpenAccess =
					item.querySelector('.icon-availability_open') !== null;

				const volume = document
					.querySelector('.issue-item_volumeIssue')
					?.textContent?.trim();

				return {
					title: titleElement?.textContent?.trim() || '',
					authors: authorElements
						.map((author) =>
							author.textContent?.trim().replace('and Others', '')
						)
						.filter(Boolean) as string[],
					publicationDetails: {
						volume: volume || '',
						date: dateText,
					},
					doi: doiElement?.getAttribute('href') || '',
					url: titleElement?.getAttribute('href')
						? `https://www.nejm.org${titleElement.getAttribute('href')}`
						: '',
					source: 'NEJM' as const,
					isOpenAccess,
				};
			});
		});
	},
};
