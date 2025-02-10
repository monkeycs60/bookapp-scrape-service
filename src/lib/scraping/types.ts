import { createDeepSeek } from '@ai-sdk/deepseek';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { Browser } from 'puppeteer';

export type SourceType =
	| 'research article'
	| 'research letter'
	| 'review'
	| 'editorial'
	| 'recommendations'
	| 'case report'
	| 'others';

export const SOURCES_TYPES = [
	'research article',
	'research letter',
	'review',
	'editorial',
	'recommendations',
	'case report',
	'others',
];
export const SOURCES_TYPES_COLORS: Record<SourceType, string> = {
	'research article': '#E3A3C4',
	'research letter': '#C99EE8',
	review: '#84C4D4',
	editorial: '#FF8C88',
	recommendations: '#FFA366',
	'case report': '#7300FF',
	others: '#FF7300',
};

export const SOURCES_TYPES_COLORS_DARK: Record<SourceType, string> = {
	'research article': '#FF0084',
	'research letter': '#7800CE',
	review: '#008CAF',
	editorial: '#DC0700',
	recommendations: '#FF7300',
	'case report': '#7300FF',
	others: '#FF7300',
};

export const NEW_SOURCE_TO_SCRAPE: (typeof SOURCES_FULL_DETAILS)[number]['id'] =
	'RSNAReview';

export type JournalSource = {
	id: string;
	cleanName: string;
	url: string;
	mainSpecialty: string;
	subSpecialties: string[];
	keywords: string[];
};

export const SOURCES_FULL_DETAILS: JournalSource[] = [
	{
		id: 'RSNA',
		cleanName: 'Radiology',
		url: 'https://pubs.rsna.org/topic/subspecialty/ca?sortBy=Earliest&pageSize=20&ContentItemType=research-article&startPage=&SeriesKey=radiology',
		mainSpecialty: 'cardiology',
		subSpecialties: ['cardiac-imaging', 'radiological-diagnosis'],
		keywords: [
			'CT-scan',
			'MRI',
			'imaging-biomarkers',
			'cardiac-imaging',
			'radiological-assessment',
		],
	},
	{
		id: 'RSNAReview',
		cleanName: 'Radiology',
		url: 'https://pubs.rsna.org/topic/subspecialty/ca?SeriesKey=radiology&sortBy=Earliest&startPage=&ContentItemType=review-article',
		mainSpecialty: 'cardiology',
		subSpecialties: ['cardiac-imaging', 'radiological-diagnosis'],
		keywords: [
			'imaging-review',
			'radiological-techniques',
			'imaging-protocols',
			'diagnostic-imaging',
		],
	},
	{
		id: 'JACC',
		cleanName: 'J Am Coll Cardiol.',
		url: 'https://www.jacc.org/action/doSearch?field1=AllField&text1=&ConceptID=&ConceptID=&publication%5B%5D=jac&publication=&Ppub=&Ppub=20240511-20241111&sortBy=Earliest&ContentItemType=research-article&startPage=0&pageSize=20',
		mainSpecialty: 'cardiology',
		subSpecialties: ['clinical-cardiology', 'interventional-cardiology'],
		keywords: [
			'cardiovascular-disease',
			'clinical-trials',
			'guidelines',
			'interventional-procedures',
		],
	},
	{
		id: 'ACVD',
		cleanName: 'Archives of Cardiovascular Diseases',
		url: 'https://www.sciencedirect.com/journal/archives-of-cardiovascular-diseases/articles-in-press',
		mainSpecialty: 'cardiology',
		subSpecialties: ['clinical-cardiology', 'cardiovascular-epidemiology'],
		keywords: [
			'cardiovascular-research',
			'clinical-studies',
			'heart-disease',
			'vascular-disorders',
		],
	},
	{
		id: 'JCMR',
		cleanName: 'Journal of Cardiovascular Magnetic Resonance',
		url: 'https://www.journalofcmr.com/inpress',
		mainSpecialty: 'cardiology',
		subSpecialties: ['cardiac-imaging', 'MRI-cardiology'],
		keywords: [
			'cardiac-MRI',
			'MR-imaging',
			'cardiovascular-imaging',
			'magnetic-resonance',
		],
	},
	{
		id: 'JACCHeartFailure',
		cleanName: 'JACC Heart Fail.',
		url: 'https://www.jacc.org/toc/heart-failure/0/0',
		mainSpecialty: 'cardiology',
		subSpecialties: ['heart-failure', 'clinical-cardiology'],
		keywords: [
			'heart-failure',
			'cardiac-function',
			'cardiac-remodeling',
			'therapeutic-strategies',
		],
	},
	{
		id: 'JACCImaging',
		cleanName: 'JACC Cardiovasc Imaging.',
		url: 'https://www.jacc.org/toc/imaging/0/0',
		mainSpecialty: 'cardiology',
		subSpecialties: ['cardiac-imaging', 'diagnostic-cardiology'],
		keywords: [
			'echocardiography',
			'cardiac-CT',
			'cardiac-MRI',
			'nuclear-imaging',
		],
	},
	{
		id: 'JACCEP',
		cleanName: 'JACC Clin Electrophysiol.',
		url: 'https://www.jacc.org/toc/electrophysiology/0/0',
		mainSpecialty: 'cardiology',
		subSpecialties: ['electrophysiology', 'arrhythmia'],
		keywords: [
			'cardiac-electrophysiology',
			'arrhythmias',
			'cardiac-rhythm',
			'ablation',
		],
	},
	{
		id: 'JACCardioOnco',
		cleanName: 'JACC CardioOncol.',
		url: 'https://www.jacc.org/toc/cardio-oncology/0/0',
		mainSpecialty: 'cardiology',
		subSpecialties: ['cardio-oncology', 'preventive-cardiology'],
		keywords: [
			'cancer-therapeutics',
			'cardiac-toxicity',
			'cardio-protection',
			'oncology',
		],
	},
	{
		id: 'JACCInterventions',
		cleanName: 'JACC Cardiovasc Interv.',
		url: 'https://www.jacc.org/toc/interventions/0/0',
		mainSpecialty: 'cardiology',
		subSpecialties: ['interventional-cardiology', 'structural-heart-disease'],
		keywords: [
			'coronary-intervention',
			'structural-intervention',
			'catheterization',
			'devices',
		],
	},
	{
		id: 'JACCAdvances',
		cleanName: 'JACC Adv.',
		url: 'https://www.jacc.org/toc/jacc-advances/0/0',
		mainSpecialty: 'cardiology',
		subSpecialties: ['innovative-cardiology', 'translational-research'],
		keywords: [
			'innovation',
			'emerging-technologies',
			'novel-therapies',
			'breakthrough-research',
		],
	},
	{
		id: 'JACCAsia',
		cleanName: 'JACC Asia.',
		url: 'https://www.jacc.org/toc/jacc-asia/0/0',
		mainSpecialty: 'cardiology',
		subSpecialties: ['clinical-cardiology', 'asian-cardiovascular-medicine'],
		keywords: [
			'asian-population',
			'regional-studies',
			'cardiovascular-epidemiology',
			'ethnic-specific-research',
		],
	},
	{
		id: 'JACCBasicTranslational',
		cleanName: 'JACC Basic Transl Sci.',
		url: 'https://www.jacc.org/toc/basic-translational/0/0',
		mainSpecialty: 'cardiology',
		subSpecialties: ['basic-science', 'translational-medicine'],
		keywords: [
			'basic-research',
			'molecular-cardiology',
			'experimental-studies',
			'translational-science',
		],
	},
	{
		id: 'AHAHypertension',
		cleanName: 'Hypertension.',
		url: 'https://www.ahajournals.org/toc/hyp/0/0',
		mainSpecialty: 'cardiology',
		subSpecialties: ['hypertension', 'vascular-medicine'],
		keywords: [
			'blood-pressure',
			'vascular-disease',
			'hypertension-therapy',
			'cardiovascular-risk',
		],
	},
	{
		id: 'AHACirculation',
		cleanName: 'Circulation.',
		url: 'https://www.ahajournals.org/toc/circ/0/0',
		mainSpecialty: 'cardiology',
		subSpecialties: ['clinical-cardiology', 'cardiovascular-research'],
		keywords: [
			'cardiovascular-medicine',
			'clinical-research',
			'basic-science',
			'translational-research',
		],
	},
	{
		id: 'AHACirculationImaging',
		cleanName: 'Circulation Cardiovasc Imaging',
		url: 'https://www.ahajournals.org/toc/circimaging/0/0',
		mainSpecialty: 'cardiology',
		subSpecialties: ['cardiac-imaging', 'cardiovascular-diagnostics'],
		keywords: [
			'multimodality-imaging',
			'cardiac-imaging-techniques',
			'imaging-biomarkers',
			'diagnostic-imaging',
		],
	},
	{
		id: 'AHACirculationResearch',
		cleanName: 'Circulation Research',
		url: 'https://www.ahajournals.org/toc/res/0/0',
		mainSpecialty: 'cardiology',
		subSpecialties: ['basic-research', 'experimental-cardiology'],
		keywords: [
			'molecular-biology',
			'cellular-cardiology',
			'experimental-research',
			'cardiovascular-science',
		],
	},
	{
		id: 'EHJ',
		cleanName: 'Eur Heart Journal',
		url: 'https://academic.oup.com/eurheartj/search-results?sort=Date+%e2%80%93+Newest+First&allJournals=1&f_ContentType=Journal+Article&f_ContentSubTypeDisplayName=Research+Article&fl_SiteID=5375&cqb=%5b%5d&page=1',
		mainSpecialty: 'cardiology',
		subSpecialties: ['clinical-cardiology', 'cardiovascular-medicine'],
		keywords: [
			'european-cardiology',
			'clinical-research',
			'cardiovascular-guidelines',
			'heart-disease',
		],
	},
	{
		id: 'EHJCardioImaging',
		cleanName: 'Eur Heart J Cardiovasc Imaging.',
		url: 'https://academic.oup.com/ehjcimaging/search-results?sort=Date+%e2%80%93+Newest+First&allJournals=1&f_ContentType=Journal+Article&f_ContentSubTypeDisplayName=Research+Article&fl_SiteID=5376&page=1',
		mainSpecialty: 'cardiology',
		subSpecialties: ['cardiac-imaging', 'multimodality-imaging'],
		keywords: [
			'imaging-techniques',
			'cardiac-assessment',
			'diagnostic-imaging',
			'imaging-biomarkers',
		],
	},
	{
		id: 'EHJDigitalHealth',
		cleanName: 'Eur Heart J Digit Health',
		url: 'https://academic.oup.com/ehjdh/search-results?allJournals=1&f_ContentType=Journal+Article&f_ContentSubTypeDisplayName=Research+Article&fl_SiteID=6319&page=1&sort=Date+%e2%80%93+Newest+First',
		mainSpecialty: 'cardiology',
		subSpecialties: ['digital-health', 'cardiology-informatics'],
		keywords: [
			'digital-medicine',
			'artificial-intelligence',
			'telemedicine',
			'digital-biomarkers',
		],
	},
	{
		id: 'NEJM',
		cleanName: 'N Engl J Med.',
		url: 'https://www.nejm.org/browse/specialty/cardiology?startPage=1&sortBy=pubdate-descending&isFiltered=true&isFilterOpen=true&topic=14_1&articleCategory=research',
		mainSpecialty: 'cardiology',
		subSpecialties: ['clinical-cardiology', 'cardiovascular-medicine'],
		keywords: [
			'clinical-trials',
			'medical-research',
			'cardiovascular-outcomes',
			'evidence-based-medicine',
		],
	},
	{
		id: 'JMRI',
		cleanName: 'Journal of Magnetic Resonance Imaging',
		url: 'https://onlinelibrary.wiley.com/toc/15222586/0/0',
		mainSpecialty: 'cardiology',
		subSpecialties: ['cardiac-imaging', 'MRI-techniques'],
		keywords: [
			'magnetic-resonance',
			'MRI-protocols',
			'cardiovascular-MRI',
			'imaging-techniques',
		],
	},
	{
		id: 'LANCET',
		cleanName: 'The Lancet',
		url: 'https://www.thelancet.com/journals/lancet/onlinefirst',
		mainSpecialty: 'cardiology',
		subSpecialties: ['clinical-cardiology', 'cardiovascular-medicine'],
		keywords: [
			'clinical-research',
			'medical-trials',
			'cardiovascular-outcomes',
			'public-health',
		],
	},
] as const;

export const SOURCES_FULL_DETAILS_IDS = SOURCES_FULL_DETAILS.map(
	(source) => source.id
);

export type SourceFullDetailsIds = (typeof SOURCES_FULL_DETAILS_IDS)[number];

export const listOfArticlesSchema = z.array(
	z.object({
		title: z.string(),
		url: z.string(),
		source: z.enum(
			SOURCES_FULL_DETAILS.map((source) => source.id) as [
				string,
				...string[]
			]
		),
	})
);

export type ListOfArticlesType = z.infer<typeof listOfArticlesSchema>;

//generate a zod schema
export const uniqueArticleSchema = z.object({
	title: z.string(),
	authors: z.array(z.object({ name: z.string(), affiliation: z.string() })),
	abstract: z
		.object({
			sections: z
				.array(z.object({ title: z.string(), content: z.string() }))
				.describe(
					'The sections within the abstract. If sourceType is not research article, the sections should only contain one section with the title "Abstract" or "Summary" or something approaching it and corresponding text. two sections cannot have the same name, it means that the content is not relevant. If there is only one section (no subsection), call it "Abstract" by default'
				),
		})
		.describe(
			'The abstract of the article. Dont take into account other sections after and before the abstract. The abstract is the text block with Abstract or Summary or something approaching it before it. It usually contains sub-sections which names are "Background", "Objectives", "Methods", "Results", "Conclusions" or "Discussion". if you find other names for subsections, the content may not be relevant (such as highlight or things like that) so pays attention to always retain the same structure. When the sourceType is not research article the abstract is only the text blocks (sometimes one, or two or three) within the Abstract or Summary section/div or something approaching it before it. Dont take into account the sub-sections. It is possible that there is no abstract, so in this case, the abstract should be an empty object.'
		),
	keywords: z
		.array(z.string())
		.describe(
			'The keywords of the article, dont take into account the abbreviation section if there is one (just the keywords one). If there is no keyword, pick up 5 relevant or your choice through your understanding of the article'
		),
	abstractImages: z
		.array(z.string())
		.describe(
			'For the image, you can only retain one image, which is usually next to the abstract and which can be found under figure image or abstract-figure or central illustration or things approaching it is a src or data-src, in order to obtain the full url please add the domain of the article url to the url of the image.'
		),
	specialDataForVector: z
		.string()
		.describe(
			'The data for vectorization. A summary of 250 characters of the article'
		),
	date: z
		.string()
		.describe('The date of the article in the format "MM-DD-YYYY"'),
	isOpenAccess: z.boolean(),
	sourceType: z
		.enum([
			'research article',
			'research letter',
			'review',
			'editorial',
			'recommendations',
			'others',
		])
		.describe(
			'The type of the article, always try to match one of the types (most of articles are research article), but if you are not sure, choose "others" and add the type in the specialDataForVector'
		),
	source: z.enum(
		SOURCES_FULL_DETAILS.map((source) => source.id) as [string, ...string[]]
	),
	doi: z
		.string()
		.describe(
			'The doi of the article, please always keep it like that https://doi.org/ the rest is the doi of the article'
		),
	url: z
		.string()
		.describe(
			'The url of the article, please be sure that this is a full link, so if there is no domain, add the domain correspounding to the source'
		),
});

export type UniqueArticleType = z.infer<typeof uniqueArticleSchema>;

export type ScrapingResult = {
	success: boolean;
	message?: string;
	articles?: UniqueArticleType[];
};

export type ScrapingContext = {
	prisma: PrismaClient;
	browser: Browser;
	google: ReturnType<typeof createGoogleGenerativeAI>;
	deepseek: ReturnType<typeof createDeepSeek>;
};

export const SOURCES: Source[] = [
	'RSNA',
	'RSNAReview',
	'JACC',
	'JCMR',
	'JACCHeartFailure',
	'JACCImaging',
	'JACCEP',
	'JACCardioOnco',
	'JACCInterventions',
	'JACCAdvances',
	'JACCAsia',
	'JACCBasicTranslational',
	'AHAHypertension',
	'AHACirculation',
	'AHACirculationImaging',
	'AHACirculationResearch',
	'EHJ',
	'EHJCardioImaging',
	'EHJDigitalHealth',
	'NEJM',
	'JMRI',
	'ACVD',
	'LANCET',
];

export const SOURCES_CLEAN_NAMES: Record<Source, string> = {
	RSNA: 'Radiology',
	RSNAReview: 'Radiology',
	JACC: 'J Am Coll Cardiol.',
	JCMR: 'Journal of Cardiovascular Magnetic Resonance',
	JACCHeartFailure: 'JACC Heart Fail.',
	JACCImaging: 'JACC Cardiovasc Imaging.',
	JACCEP: 'JACC Clin Electrophysiol.',
	JACCardioOnco: 'JACC CardioOncol.',
	JACCInterventions: 'JACC Cardiovasc Interv. ',
	JACCAdvances: 'JACC Adv.',
	JACCAsia: 'JACC Asia.',
	JACCBasicTranslational: 'JACC Basic Transl Sci.',
	EHJ: 'Eur Heart Journal',
	EHJCardioImaging: 'Eur Heart J Cardiovasc Imaging.',
	EHJDigitalHealth: 'Eur Heart J Digit Health',
	NEJM: 'N Engl J Med. ',
	AHACirculation: 'Circulation.',
	AHACirculationImaging: 'Circulation Cardiovasc Imaging',
	AHACirculationResearch: 'Circulation Research',
	AHAHypertension: 'Hypertension.',
	JMRI: 'Journal of Magnetic Resonance Imaging',
	ACVD: 'Archives of Cardiovascular Diseases',
	LANCET: 'The Lancet',
};

export type Source =
	| 'RSNA'
	| 'JACC'
	| 'JCMR'
	| 'JACCHeartFailure'
	| 'JACCImaging'
	| 'JACCEP'
	| 'JACCardioOnco'
	| 'JACCInterventions'
	| 'JACCAdvances'
	| 'JACCAsia'
	| 'JACCBasicTranslational'
	| 'AHAHypertension'
	| 'AHACirculation'
	| 'AHACirculationImaging'
	| 'AHACirculationResearch'
	| 'EHJ'
	| 'EHJCardioImaging'
	| 'EHJDigitalHealth'
	| 'RSNAReview'
	| 'NEJM'
	| 'JMRI'
	| 'ACVD'
	| 'LANCET';

export interface ScrapedArticle {
	title?: string;
	authors?: string[];
	originalSourceType?: string;
	sourceType?: string;
	publicationDetails?: {
		volume: string;
		date: string;
	};
	doi?: string;
	url?: string;
	source?: Source;
	isOpenAccess?: boolean;
	keywords?: string[];
}
