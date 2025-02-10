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
		console.error(`❌ Source ${sourceId} non trouvée`);
		return { success: false, message: `Source ${sourceId} not found` };
	}

	try {
		console.log(`🚀 Démarrage du scraping pour la source: ${source.id}`);
		console.log(`📡 URL de la source: ${source.url}`);

		// 1. Get list of articles
		console.log(`📑 Récupération de la liste des articles...`);
		const articlesList = await scrapeArticlesList(context, source);
		console.log(
			`✅ ${articlesList.length} articles trouvés pour ${source.id}`
		);

		// 2. Filter out existing articles
		console.log(`🔍 Filtrage des articles existants...`);
		const articlesToProcess = await filterNewArticles(
			context.prisma,
			articlesList
		);
		console.log(
			`📊 ${articlesToProcess.length}/${articlesList.length} nouveaux articles à traiter pour ${source.id}`
		);

		// 3. Process each article sequentially
		const processedArticles: UniqueArticleType[] = [];

		for (const [index, article] of articlesToProcess.entries()) {
			console.log(
				`\n🔄 Traitement de l'article ${index + 1}/${
					articlesToProcess.length
				}`
			);
			console.log(`📖 Titre: ${article.title}`);

			const processedArticle = await scrapeAndAnalyzeArticle(
				context,
				article
			);

			if (processedArticle) {
				processedArticles.push(processedArticle);
				await saveArticleToDB(context.prisma, processedArticle);
				console.log(`💾 Article sauvegardé: ${processedArticle.title}`);
			} else {
				console.warn(
					`⚠️ Échec du traitement pour l'article: ${article.title}`
				);
			}
		}

		console.log(`\n✨ Scraping terminé pour ${source.id}`);
		console.log(
			`📈 Résultats: ${processedArticles.length} articles traités avec succès`
		);

		return {
			success: true,
			articles: processedArticles,
			message: `Successfully processed ${processedArticles.length} articles for ${source.id}`,
		};
	} catch (error) {
		console.error(
			`❌ Erreur lors du traitement de la source ${source.id}:`,
			error
		);
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
	console.log(`\n🎯 Démarrage du scraping pour toutes les sources`);

	for (const [index, source] of SOURCES_FULL_DETAILS.entries()) {
		console.log(
			`\n📌 Source ${index + 1}/${SOURCES_FULL_DETAILS.length}: ${source.id}`
		);
		const result = await processSingleSource(context, source.id);
		results.push(result);
	}

	console.log(`\n🏁 Scraping terminé pour toutes les sources`);
	return results;
};
