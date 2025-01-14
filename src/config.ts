import { z } from 'zod';

const configSchema = z.object({
	PORT: z.string().transform(Number),
	API_KEY: z.string().min(1),
	ALLOWED_ORIGINS: z.string().transform((origins) => origins.split(',')),
	PROXY_USERNAME: z.string(),
	PROXY_PASSWORD: z.string(),
	PROXY_HOST: z.string(),
	PROXY_PORT: z.string(),
	RECAPTCHA_API_KEY: z.string(),
	MAIN_APP_URL: z.string(),
	MAIN_APP_API_KEY: z.string(),
});

export type Config = z.infer<typeof configSchema>;

export function loadConfig(): Config {
	const config = configSchema.safeParse({
		PORT: process.env.PORT || '3000',
		API_KEY: process.env.API_KEY,
		ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:3000',
		PROXY_USERNAME: process.env.PROXY_USERNAME,
		PROXY_PASSWORD: process.env.PROXY_PASSWORD,
		PROXY_HOST: process.env.PROXY_HOST,
		PROXY_PORT: process.env.PROXY_PORT,
		RECAPTCHA_API_KEY: process.env.RECAPTCHA_API_KEY,
		MAIN_APP_URL: process.env.MAIN_APP_URL,
		MAIN_APP_API_KEY: process.env.MAIN_APP_API_KEY,
	});

	if (!config.success) {
		throw new Error(`Invalid configuration: ${config.error.message}`);
	}

	return config.data;
}
