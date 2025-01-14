import type { Page } from 'puppeteer';

export type SourceType =
	| 'research article'
	| 'research letter'
	| 'review'
	| 'editorial'
	| 'recommendations';

export const SOURCES_TYPES = [
	'research article',
	'research letter',
	'review',
	'editorial',
	'recommendations',
];
export const SOURCES_TYPES_COLORS: Record<SourceType, string> = {
	'research article': '#E3A3C4',
	'research letter': '#C99EE8',
	review: '#84C4D4',
	editorial: '#FF8C88',
	recommendations: '#FFA366',
};

export const SOURCES_TYPES_COLORS_DARK: Record<SourceType, string> = {
	'research article': '#FF0084',
	'research letter': '#7800CE',
	review: '#008CAF',
	editorial: '#DC0700',
	recommendations: '#FF7300',
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

export interface SourceGradient {
	from: string;
	to: string;
}

export const SOURCE_GRADIENTS: Record<Source, SourceGradient> = {
	// JACC Family - Tons de bleus
	JACC: { from: '#2193b0', to: '#6dd5ed' },
	JCMR: { from: '#2193b0', to: '#6dd5ed' },
	JMRI: { from: '#2193b0', to: '#6dd5ed' },
	JACCHeartFailure: { from: '#4481eb', to: '#04befe' },
	JACCImaging: { from: '#0082c8', to: '#667db6' },
	JACCEP: { from: '#2980b9', to: '#6dd5fa' },
	JACCardioOnco: { from: '#36D1DC', to: '#5B86E5' },
	JACCInterventions: { from: '#56CCF2', to: '#2F80ED' },
	JACCAdvances: { from: '#0093E9', to: '#80D0C7' },
	JACCAsia: { from: '#4DA0B0', to: '#D39D38' },
	JACCBasicTranslational: { from: '#6190E8', to: '#A7BFE8' },
	ACVD: { from: '#6190E8', to: '#A7BFE8' },

	// AHA Family - Tons de rouges
	AHAHypertension: { from: '#ee0979', to: '#ff6a00' },
	AHACirculation: { from: '#f85032', to: '#e73827' },
	AHACirculationImaging: { from: '#cb356b', to: '#bd3f32' },

	// EHJ Family - Tons de verts
	EHJ: { from: '#134E5E', to: '#71B280' },
	EHJCardioImaging: { from: '#02AAB0', to: '#00CDAC' },
	EHJDigitalHealth: { from: '#11998e', to: '#38ef7d' },

	// RSNA Family - Tons de violets
	RSNA: { from: '#834d9b', to: '#d04ed6' },
	RSNAReview: { from: '#8E2DE2', to: '#4A00E0' },

	// NEJM - Ton unique
	NEJM: { from: '#373B44', to: '#4286f4' },
	LANCET: { from: '#373B44', to: '#4286f4' },
	AHACirculationResearch: { from: '#373B44', to: '#4286f4' },
};

export interface PublicationDetails {
	volume: string;
	date: string;
}

export interface Article {
	title: string;
	authors: string[];
	publicationDetails: PublicationDetails;
	doi: string;
	url: string;
	source: Source;
	isOpenAccess?: boolean;
	keywords?: string[];
}

export interface ScrapingStrategy {
	url: string;
	evaluate: (page: Page) => Promise<Article[]>;
	getAbstract?: (page: Page) => Promise<Record<string, string> | null>;
}

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
	abstract?: {
		[key: string]: { text: string } | string[] | undefined;
	};
	image?: string[];
}

export interface AbstractSection {
	title: string;
	text: string;
	image?: string;
	index: number;
	keywords?: string[];
	authors?: string[];
}

export interface AbstractData {
	[key: string]: AbstractSection | string[] | undefined;
}
