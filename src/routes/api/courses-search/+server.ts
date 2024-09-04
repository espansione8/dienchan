// src/routes/api/courses-search
import { json } from '@sveltejs/kit';
import dbConnect from '$lib/database';
import { Users } from '$lib/models/Users.model';

export const POST = async ({ request }) => { // {url, request}
	const body = await request.json();
	const {
		monthSelected
	} = body
	console.log('body', body);
	try {
		await dbConnect();

		//get courses data
		const coursesFilter = {
			month: monthSelected,
		}
		console.log('coursesFilter', coursesFilter);

		const coursesSearch = await Users.find(coursesFilter, { password: 0, _id: 0 })
			.lean()
			.exec();

		console.log('coursesSearch', coursesSearch);
		if (coursesSearch) {
			return json(coursesSearch);
		}

		// general error update
		return json(
			{
				message: 'Courses not found'
			},
			{
				status: 500
			}
		);

	} catch (err) {
		console.log('Courses get data ERROR:', err);
		return json(
			{
				message: 'Courses get data Failed'
			},
			{
				status: 500
			}
		);
	}
};