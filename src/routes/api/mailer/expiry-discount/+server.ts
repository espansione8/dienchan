// `${BASE_URL}/api/mailer/expiry-discount`
import type { RequestHandler } from '@sveltejs/kit';
import { BASE_URL, APIKEY } from '$env/static/private';
import { json, error } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const {
		apiKey
	} = body;

	if (apiKey !== APIKEY) {
		return json({ message: 'CRON api error' }, { status: 401 });
	}

	const now = new Date();
	const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

	let expiredCount = 0;
	let promoExpiredCount = 0;

	try {
		// ============================================
		// Cerca sconti scaduti e ancora attivi
		// ============================================

		const resExpiredFetch = await fetch(`${BASE_URL}/api/mongo/find`, {
			method: 'POST',
			body: JSON.stringify({
				apiKey: APIKEY,
				schema: 'discount',
				query: {
					expiryDate: {
						$lt: startOfToday,
						$ne: null
					},
					status: 'enabled'
				},
				projection: { _id: 0 },
				sort: { createdAt: -1 },
				limit: 10000,
				skip: 0
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!resExpiredFetch.ok) {
			console.error('Expired discounts fetch error:', resExpiredFetch.status, await resExpiredFetch.text());
			return json({ message: 'CRON api error: discount fetch error' }, { status: 500 });
		}

		const expiredDiscounts = await resExpiredFetch.json();

		for (const discount of expiredDiscounts) {
			try {
				const updateRes = await fetch(`${BASE_URL}/api/mongo/update`, {
					method: 'POST',
					body: JSON.stringify({
						apiKey: APIKEY,
						schema: 'discount',
						query: { discountId: discount.discountId },
						update: {
							status: 'disabled'
						}
					}),
					headers: {
						'Content-Type': 'application/json'
					}
				});

				if (!updateRes.ok) {
					console.error(`Failed to disable discount ${discount.code || discount.discountId}`);
					continue;
				}

				expiredCount++;

			} catch (err) {
				console.error(`Error processing expired discount ${discount.code || discount.discountId}:`, err);
			}
		}

		// ============================================
		// Controlla promo price scadute sui prodotti
		// ============================================

		try {
			const resPromoFetch = await fetch(`${BASE_URL}/api/mongo/find`, {
				method: 'POST',
				body: JSON.stringify({
					apiKey: APIKEY,
					schema: 'product',
					query: {
						promoEndDate: {
							$lt: startOfToday,
							$ne: null
						},
						promoStatus: 'enabled'
					},
					projection: { _id: 0, prodId: 1, title: 1, promoEndDate: 1 },
					sort: { createdAt: -1 },
					limit: 10000,
					skip: 0
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!resPromoFetch.ok) {
				console.error('Expired promos fetch error:', resPromoFetch.status, await resPromoFetch.text());
			} else {
				const expiredPromos = await resPromoFetch.json();

				for (const product of expiredPromos) {
					try {
						const updateRes = await fetch(`${BASE_URL}/api/mongo/update`, {
							method: 'POST',
							body: JSON.stringify({
								apiKey: APIKEY,
								schema: 'product',
								query: { prodId: product.prodId },
								update: {
									$set: {
										promoStatus: 'disabled'
									}
								},
								options: { upsert: false },
								multi: false
							}),
							headers: {
								'Content-Type': 'application/json'
							}
						});

						if (!updateRes.ok) {
							console.error(`Failed to disable promo for ${product.title || product.prodId}`);
							continue;
						}

						promoExpiredCount++;

					} catch (err) {
						console.error(`Error processing expired promo ${product.prodId}:`, err);
					}
				}
			}
		} catch (err) {
			console.error('Error in promo expiry check:', err);
		}

		// ============================================

		return json({
			message: 'Expiry process completed successfully',
			expired: {
				discountCount: expiredCount,
				discountAction: 'Discounts disabled automatically',
				promoCount: promoExpiredCount,
				promoAction: 'Promo prices disabled automatically'
			}
		}, { status: 200 });

	} catch (err) {
		console.error('Error in discount expiry cron:', err);
		throw error(500, `Server Error Discount Expiry Cron: ${err.message}`);
	}
};