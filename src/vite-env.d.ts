/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_MOCA_HUB_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
