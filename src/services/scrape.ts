import {
	filterNewArticles,
	saveArticleToDB,
	scrapeAndAnalyzeArticle,
} from '../utils/scraping-service';

import { scrapeArticlesList } from '../utils/scraping-service';

import { SOURCES_FULL_DETAILS, UniqueArticleType } from '../lib/scraping/types';

import { ScrapingResult } from '../lib/scraping/types';

import { ScrapingContext } from '../lib/scraping/types';

export const processSingleSource = async (
	context: ScrapingContext,
	sourceId: string
): Promise<ScrapingResult> => {
	const source = SOURCES_FULL_DETAILS.find((s) => s.id === sourceId);
	if (!source) {
		return { success: false, message: `Source ${sourceId} not found` };
	}

	try {
		console.log(`Starting scraping for source: ${source.id}`);

		// 1. Get list of articles
		const articlesList = await scrapeArticlesList(context, source);
		console.log(`Found ${articlesList.length} articles for ${source.id}`);

		// 2. Filter out existing articles
		const articlesToProcess = await filterNewArticles(
			context.prisma,
			articlesList
		);
		console.log(
			`${articlesToProcess.length} new articles to process for ${source.id}`
		);

		// 3. Process each article sequentially and save immediately
		const processedArticles: UniqueArticleType[] = [];

		for (const article of articlesToProcess) {
			const processedArticle = await scrapeAndAnalyzeArticle(
				context,
				article
			);
			if (processedArticle) {
				processedArticles.push(processedArticle);
				await saveArticleToDB(context.prisma, processedArticle);
				console.log(`Saved article: ${processedArticle.title}`);
			}
		}

		return {
			success: true,
			articles: processedArticles,
			message: `Successfully processed ${processedArticles.length} articles for ${source.id}`,
		};
	} catch (error) {
		console.error(`Error processing source ${source.id}:`, error);
		return {
			success: false,
			message: `Error processing source ${source.id}: ${error}`,
		};
	}
};

export const processAllSources = async (
	context: ScrapingContext
): Promise<ScrapingResult[]> => {
	const results: ScrapingResult[] = [];

	for (const source of SOURCES_FULL_DETAILS) {
		const result = await processSingleSource(context, source.id);
		results.push(result);
	}

	return results;
};
