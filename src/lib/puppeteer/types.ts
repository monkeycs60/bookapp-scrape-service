export interface Chrome {
    runtime: Record<string, unknown>;
}

export interface CustomPermissionStatus {
    state: PermissionState;
    name?: string;
    onchange?: null;
    addEventListener?: () => void;
    removeEventListener?: () => void;
    dispatchEvent?: () => boolean;
}

export interface CustomPermissions {
    query: (descriptor: { name: string }) => Promise<CustomPermissionStatus>;
}

export interface CustomNavigator {
    webdriver?: boolean;
    chrome?: Chrome;
    permissions: CustomPermissions;
}

export interface CustomWindow {
    chrome?: Chrome;
    navigator: CustomNavigator;
    cdc_adoQpoasnfa76pfcZLmcfl_Array?: unknown;
    cdc_adoQpoasnfa76pfcZLmcfl_Promise?: unknown;
    cdc_adoQpoasnfa76pfcZLmcfl_Symbol?: unknown;
} 