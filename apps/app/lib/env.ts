const LOCAL_API_URL = "http://localhost:3001";
const LINK_PRODUCTION_API_URL = "https://link-agentic-crm-api.vercel.app";

export const API_URL =
	process.env.NEXT_PUBLIC_API_URL ??
	(process.env.VERCEL ? LINK_PRODUCTION_API_URL : LOCAL_API_URL);

export function isMarketing(): boolean {
	return process.env.IS_MARKETING === "true";
}
