import { Page } from 'puppeteer';
import { scrapeWithRetry } from './../../scraping/strategies';
import { AbstractSection } from './../../../types/types';

export const acvdAbstractStrategy = async (page: Page, url: string) => {
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

        // Récupérer les mots-clés
        const keywords = Array.from(
            document.querySelectorAll('#keywords-2 ol li a')
        );
        const keywordsText = keywords
            .map((li) => li.textContent?.trim())
            .filter(Boolean) as string[];

        sections['Keywords'] = {
            title: 'Keywords',
            text: keywordsText.join(', '),
            keywords: keywordsText,
            index: currentIndex++,
        };

        // Récupérer le type d'article
        const originalSourceType = document.querySelector('.meta-panel__type');
        if (originalSourceType) {
            sections['originalSourceType'] = {
                title: 'originalSourceType',
                text: originalSourceType.textContent?.trim() || '',
                index: currentIndex++,
            };
        }

        const figure = document.querySelectorAll(
            '.graphic a img'
        )[0] as HTMLImageElement;
        if (figure) {
            sections['image'] = {
                title: 'image',
                text: figure.src || '',
                index: currentIndex++,
            };
        }

        // Récupérer les auteurs
        const allAuthors = Array.from(
            document.querySelectorAll('.authors span a')
        );

        const authorsDetails = allAuthors.map(author => {
            const givenName = author.querySelector('span[property="givenName"]')?.textContent?.trim();
            const familyName = author.querySelector('span[property="familyName"]')?.textContent?.trim();
            return givenName && familyName ? `${givenName} ${familyName}` : null;
        }).filter(Boolean);

        sections['Authors'] = {
            title: 'Authors',
            text: authorsDetails.join(', '),
            authors: authorsDetails as string[],
            index: currentIndex++,
        };

        // Récupérer les sections de l'abstract
        document
            .querySelectorAll(
                '#author-abstract section'
            )
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
