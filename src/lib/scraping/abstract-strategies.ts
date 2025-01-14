import { Page } from 'puppeteer';
import { Source } from '../../types/types';
import { AbstractSection } from '../../types/types';
import {
	jaccAbstractStrategy,
	jaccImagingAbstractStrategy,
	jaccHeartFailureAbstractStrategy,
	jaccEpAbstractStrategy,
	jaccCardioOncoAbstractStrategy,
	jaccInterventionsAbstractStrategy,
	jaccAdvancesAbstractStrategy,
	jaccAsiaAbstractStrategy,
	jaccBasicTranslationalAbstractStrategy,
	rsnaAbstractStrategy,
	rsnaReviewAbstractStrategy,
	ehjAbstractStrategy,
	ehjCardioImagingAbstractStrategy,
	ehjDigitalHealthAbstractStrategy,
	ahaCirculationAbstractStrategy,
	ahaCirculationImagingAbstractStrategy,
	ahaHypertensionAbstractStrategy,
	nejmAbstractStrategy,
	jcmrAbstractStrategy,
	jmriAbstractStrategy,
	acvdAbstractStrategy,
	lancetAbstractStrategy,
	ahaCirculationResearchAbstractStrategy,
} from '../journals';

type AbstractStrategy = (
	page: Page,
	url: string
) => Promise<Record<string, AbstractSection> | null>;

const abstractStrategies: Record<Source, AbstractStrategy> = {
	JACC: jaccAbstractStrategy,
	JACCImaging: jaccImagingAbstractStrategy,
	JACCHeartFailure: jaccHeartFailureAbstractStrategy,
	JACCEP: jaccEpAbstractStrategy,
	JACCardioOnco: jaccCardioOncoAbstractStrategy,
	JACCInterventions: jaccInterventionsAbstractStrategy,
	JACCAdvances: jaccAdvancesAbstractStrategy,
	JACCAsia: jaccAsiaAbstractStrategy,
	JACCBasicTranslational: jaccBasicTranslationalAbstractStrategy,
	RSNA: rsnaAbstractStrategy,
	RSNAReview: rsnaReviewAbstractStrategy,
	EHJ: ehjAbstractStrategy,
	EHJCardioImaging: ehjCardioImagingAbstractStrategy,
	EHJDigitalHealth: ehjDigitalHealthAbstractStrategy,
	AHACirculation: ahaCirculationAbstractStrategy,
	AHACirculationImaging: ahaCirculationImagingAbstractStrategy,
	AHAHypertension: ahaHypertensionAbstractStrategy,
	NEJM: nejmAbstractStrategy,
	JCMR: jcmrAbstractStrategy,
	JMRI: jmriAbstractStrategy,
	ACVD: acvdAbstractStrategy,
	LANCET: lancetAbstractStrategy,
	AHACirculationResearch: ahaCirculationResearchAbstractStrategy,
};

export const getAbstractStrategy = (source: Source) =>
	abstractStrategies[source];
