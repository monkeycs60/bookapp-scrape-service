import { ScrapingStrategy } from './../../../types/types';

export const jaccArticleStrategy: ScrapingStrategy = {
	url: 'https://www.jacc.org/action/doSearch?field1=AllField&text1=&ConceptID=&ConceptID=&publication%5B%5D=jac&publication=&Ppub=&Ppub=20240511-20241111&sortBy=Earliest&ContentItemType=research-article&startPage=0&pageSize=20',
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
					source: 'JACC' as const,
					isOpenAccess,
				};
			});
		});
	},
};
