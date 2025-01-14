import { ScrapingStrategy } from './../../../types/types';

export const ehjDigitalHealthArticleStrategy: ScrapingStrategy = {
	url: 'https://academic.oup.com/ehjdh/search-results?allJournals=1&f_ContentType=Journal+Article&f_ContentSubTypeDisplayName=Research+Article&fl_SiteID=6319&page=1&sort=Date+%e2%80%93+Newest+First',
	evaluate: async (page) => {
		return page.evaluate(() => {
			const items = Array.from(
				document.querySelectorAll('.sr-list.al-article-box')
			);
			console.log("Nombre d'articles trouvés:", items.length);

			return items.map((item) => {
				const titleElement = item.querySelector('.at-sr-item-title-link a');

				const authorElements = Array.from(
					item.querySelectorAll('.sri-authors')
				);
				const dateElement = item.querySelector('.sri-date');
				const doiElement = item.querySelector('.al-citation-list a');
				const isOpenAccess =
					item.querySelector('.icon-availability_open') !== null;

				// Extraire le volume et la date de la citation
				const citationText =
					item.querySelector('.al-citation-list')?.textContent || '';
				const volumeMatch = citationText.match(/Volume (\d+)/);
				const volume = volumeMatch ? volumeMatch[1] : '';

				// Extraire la date de publication
				const dateText = dateElement?.textContent || '';
				const dateMatch = dateText.match(
					/Published:\s*(\d+\s+\w+\s+\d{4})/
				);
				const date = dateMatch ? dateMatch[1] : '';

				return {
					title: titleElement?.textContent?.trim() || '',
					authors: authorElements
						.map((author) => author.textContent?.trim())
						.filter(Boolean) as string[],
					publicationDetails: {
						volume,
						date,
					},
					doi: doiElement?.getAttribute('href') || '',
					url: titleElement?.getAttribute('href')
						? `https://academic.oup.com${titleElement.getAttribute(
								'href'
						  )}`
						: '',
					source: 'EHJDigitalHealth' as const,
					isOpenAccess,
				};
			});
		});
	},
};
