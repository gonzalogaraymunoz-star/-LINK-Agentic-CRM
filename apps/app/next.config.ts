import { loadRootEnv } from "@crm/env";
import type { NextConfig } from "next";

loadRootEnv();

const LOCAL_API_URL = "http://localhost:3001";
const LINK_PRODUCTION_API_URL = "https://link-agentic-crm-api.vercel.app";
const LINK_PRODUCTION_APP_URL = "https://link-agentic-crm.vercel.app";

const apiUrl =
	process.env.API_URL ??
	process.env.NEXT_PUBLIC_API_URL ??
	(process.env.VERCEL ? LINK_PRODUCTION_API_URL : LOCAL_API_URL);

const appUrl =
	process.env.APP_URL ??
	(process.env.VERCEL ? LINK_PRODUCTION_APP_URL : "");

const allowedDevOrigins = appUrl
	.split(",")
	.flatMap((origin) => {
		try {
			return [new URL(origin.trim()).hostname];
		} catch {
			return [];
		}
	});

const nextConfig: NextConfig = {
	allowedDevOrigins,

	env: {
		NEXT_PUBLIC_API_URL: apiUrl,
	},

	transpilePackages: ["@crm/auth", "@crm/db", "@crm/telemetry", "@crm/ui"],

	serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],

	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "**.blob.vercel-storage.com" },
		],
	},

	cacheComponents: true,
	partialPrefetching: true,
};

export default nextConfig;
