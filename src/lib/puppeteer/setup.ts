import { type Browser, type Page } from 'puppeteer';
import { DEFAULT_HEADERS } from './config';
import type { CustomWindow } from './types';

export async function setupPage(browser: Browser): Promise<Page> {
    const page = await browser.newPage();
    
    await setupAntiDetection(page);
    await setupHeaders(page);
    await setupViewport(page);

    return page;
}

async function setupAntiDetection(page: Page): Promise<void> {
    await page.evaluateOnNewDocument(() => {
        const win = window as unknown as CustomWindow;
        
        Object.defineProperty(win.navigator, 'webdriver', {
            get: () => undefined,
        });
        
        win.chrome = { runtime: {} };
        win.navigator.chrome = { runtime: {} };
        
        const originalQuery = win.navigator.permissions.query;
        win.navigator.permissions.query = (parameters: { name: string }) => 
            parameters.name === 'notifications'
                ? Promise.resolve({
                    state: Notification.permission as PermissionState,
                    addEventListener: () => {},
                    removeEventListener: () => {},
                    dispatchEvent: () => false,
                    onchange: null,
                    name: parameters.name,
                })
                : originalQuery(parameters);
        
        delete win.cdc_adoQpoasnfa76pfcZLmcfl_Array;
        delete win.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
        delete win.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;

        Object.defineProperty(navigator, 'plugins', {
            get: () => [1, 2, 3, 4, 5],
        });

        Object.defineProperty(navigator, 'languages', {
            get: () => ['fr-FR', 'fr', 'en-US', 'en'],
        });
    });
}

async function setupHeaders(page: Page): Promise<void> {
    await page.setExtraHTTPHeaders(DEFAULT_HEADERS);
}

async function setupViewport(page: Page): Promise<void> {
    await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
    });
}

export async function addHumanBehavior(page: Page): Promise<void> {
    // Simuler des mouvements de souris aléatoires
    await page.mouse.move(
        Math.random() * 500,
        Math.random() * 500,
        { steps: 10 }
    );

    // Ajouter un délai aléatoire
    await new Promise(resolve => 
        setTimeout(resolve, Math.floor(Math.random() * 1000) + 500)
    );
} 