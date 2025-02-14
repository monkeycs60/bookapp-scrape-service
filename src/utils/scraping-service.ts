import {
	listOfArticlesSchema,
	ListOfArticlesType,
	UniqueArticleType,
	SOURCES_FULL_DETAILS,
	uniqueArticleSchema,
} from '../lib/scraping/types';
import { z } from 'zod';

import { generateObject, generateText, LanguageModelV1 } from 'ai';
import {
	setupScrapingPage,
	handlePageLoad,
	scrapeWithRetry,
} from '../lib/scraping/strategies';
import { ScrapingContext } from '../lib/scraping/types';
import { Prisma, PrismaClient } from '@prisma/client';
import fs from 'fs';

// scraper pour récupérer la liste des articles
export const scrapeArticlesList = async (
	context: ScrapingContext,
	source: (typeof SOURCES_FULL_DETAILS)[number]
): Promise<ListOfArticlesType> => {
	const finalPage = await setupScrapingPage(context.browser);

	try {
		await scrapeWithRetry(finalPage, source.url);
		await handlePageLoad(finalPage);
		await finalPage.waitForSelector('body', { timeout: 30000 });

		const htmlContent = await finalPage.evaluate(
			() => document.documentElement.outerHTML
		);

		const prompt = `
      Analyze the following page which is a list of scientific articles, i want you to return an array containing the url and title
      of the articles and the source (the source is ${source.id}). You should build the url by adding the source url to the domain 
      of the article url (${source.url}) or by retrieving the full doi of the article (beginning by 'https://doi.org/').
      The page is: ${htmlContent}
    `;

		const result = await generateObject({
			model: context.google('gemini-2.0-flash-exp', {
				structuredOutputs: true,
			}),
			prompt,
			schema: listOfArticlesSchema,
		});

		return result.object;
	} finally {
		if (finalPage && !finalPage.isClosed()) {
			await finalPage.close();
		}
	}
};

// scraper pour récupérer les informations d'un article
export const scrapeAndAnalyzeArticle = async (
	context: ScrapingContext,
	article: ListOfArticlesType[number]
): Promise<UniqueArticleType | null> => {
	const finalPage = await setupScrapingPage(context.browser);

	try {
		if (!article.url) {
			console.log(`No URL for article: ${article.title}`);
			return null;
		}

		await scrapeWithRetry(finalPage, article.url);
		await handlePageLoad(finalPage);

		const htmlContent = await finalPage.evaluate(
			() => document.documentElement.outerHTML
		);

		await finalPage.screenshot({
			path: `screenshot.webp`,
			type: 'webp',
			optimizeForSpeed: true,
			fullPage: true,
			quality: 90,
		});
		const image = fs.readFileSync(`screenshot.webp`);

		const initialPrompt = `
      Analyze the following medical article and extract key information in a structured way in a Json format following the schema. 
      The article is: ${article.title}
      The article url is: ${article.url}
      The article source is: ${article.source}
      The article content is: ${htmlContent}
    `;

		const initialResult = await generateWithRetry<UniqueArticleType>({
			prompt: initialPrompt,
			schema: uniqueArticleSchema,
			model: context.google('gemini-2.0-flash-exp', {
				structuredOutputs: true,
			}),
		});

		console.log({ initialResult });

		const { text } = await generateText({
			model: context.google('gemini-2.0-flash-exp'),
			system: `Here is a screenshot of a medical article. And then you have a json object which contains major informations about this article. I want you to return a new json object with the same structure but with corrected informations.`,
			messages: [
				{
					role: 'user',
					content: [
						{ type: 'image', image: image },
						{
							type: 'text',
							text: ` Here is a screenshot of a medical article. And then you have a json object which contains major informations about this article. I want you to return a new json object with the same structure but with corrected informations.
			Most of these infos must be true but you must watch if the abstract structure and content is accurate compared to what you see
			on the screenshot. Sometimes the json object contains parts that are not supposed to appeared on the abstract (before the abstract or after)
			or sometimes the type of the article suppose that there is no abstract (when there is only one image for example, with no text), so return an empty abstract with empty section. If there is no abstract and just an image, just return an empty abstract and empty maintext. Same for keywords. Do not correct the authors because some of them must be hidden because of chrevon 'see more'. If there is no need to correct the json object, just return it as it is.: ${JSON.stringify(
				initialResult
			)}`,
						},
					],
				},
			],
		});

		console.log({ text });

		// DeepSeek review
		const finalPrompt = `
      I will give you a json object in a string format containing the article information. I want you to return it in a json format following the schema.
      The json object is: ${text}
    `;

		const finalResult = await generateWithRetry<UniqueArticleType>({
			prompt: finalPrompt,
			schema: uniqueArticleSchema,
			model: context.google('gemini-2.0-flash-exp', {
				structuredOutputs: true,
			}),
		});

		console.log({ finalResult });

		return finalResult;
	} catch (error) {
		console.error(`Error processing article ${article.title}:`, error);
		return null;
	} finally {
		if (finalPage && !finalPage.isClosed()) {
			await finalPage.close();
		}
	}
};

export const saveArticleToDB = async (
	prisma: PrismaClient,
	article: UniqueArticleType
): Promise<void> => {
	await prisma.article.upsert({
		where: { title: article.title },
		update: {
			authors: Array.from(
				new Set(article.authors.map((author) => author.name))
			),
			date: article.date,
			doi: article.doi,
			url: article.url,
			source: article.source,
			isOpenAccess: article.isOpenAccess,
			keywords: Array.from(new Set(article.keywords)),
			abstract: article.abstract,
			image: article.abstractImages,
			sourceType: article.sourceType,
			vectorSummary: article.specialDataForVector,
		},
		create: {
			title: article.title,
			authors: article.authors.map((author) => author.name),
			date: article.date,
			doi: article.doi,
			url: article.url,
			source: article.source,
			isOpenAccess: article.isOpenAccess,
			keywords: article.keywords,
			abstract: article.abstract,
			image: article.abstractImages,
			sourceType: article.sourceType,
			vectorSummary: article.specialDataForVector,
		},
	});
};

export const filterNewArticles = async (
	prisma: PrismaClient,
	articles: ListOfArticlesType
): Promise<ListOfArticlesType> => {
	const existingArticles = await prisma.article.findMany({
		where: {
			title: {
				in: articles.map((a) => a.title).filter(Boolean) as string[],
			},
			abstract: { not: null },
		},
		select: { title: true },
	});
	console.log({ existingArticles });

	return articles.filter(
		(article) =>
			!existingArticles.find(
				(ea: { title: string }) => ea.title === article.title
			)
	);
};

type GenerateObjectOptions<T> = {
	schema: z.ZodSchema<T>;
	prompt: string;
	model: LanguageModelV1;
};

export async function generateWithRetry<T>(
	options: GenerateObjectOptions<T>,
	retries = 3,
	delayMs = 2000
): Promise<T> {
	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			const result = await generateObject({
				model: options.model,
				prompt: options.prompt,
				schema: options.schema,
				maxRetries: 3,
			});
			return result.object as T;
		} catch (error) {
			if (attempt === retries) throw error;
			console.log(`Attempt ${attempt} failed. Retrying in ${delayMs}ms...`);
			await new Promise((resolve) => setTimeout(resolve, delayMs));
			delayMs *= 2; // Backoff exponentiel
		}
	}
	throw new Error('All retry attempts failed');
}
