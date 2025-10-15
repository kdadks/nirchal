/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_EMAIL_FUNCTION_BASE?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
