export const getVideosByLevel = async (fetch: typeof globalThis.fetch, userLevel: string) => {
	try {
		const res = await fetch('/api/video', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ level: userLevel })
		});

		if (!res.ok) {
			console.error('Failed to fetch videos:', res.status);
			return [];
		}

		const videos = await res.json();
		return videos;
	} catch (error) {
		console.error('Error fetching videos:', error);
		return [];
	}
};