import { DOWNLOAD_URL } from '#lib/site.js';
import type { RequestHandler } from './$types';

export const prerender = false;

export const GET: RequestHandler = () =>
	new Response(null, {
		status: 302,
		headers: { location: DOWNLOAD_URL, 'cache-control': 'no-store' }
	});
