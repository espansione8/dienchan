// src/routes/api/users/update-photo
import { json } from '@sveltejs/kit';
import dbConnect from '$lib/database';
import { Users } from '$lib/models/Users.model';

//write debug file
// import fs from 'node:fs';
// const debug = (message: string) => {
// 	fs.writeFileSync('/log/jobspronto.log', `${message}\n`, { flag: 'a' });
// };


export const POST = async ({ request }) => {
	const body = await request.json();
	const { type, email, fileName, action } = body
	// debug(`body: ${JSON.stringify(body)}`);
	// console.log('body', body);

	try {
		await dbConnect();

		//check esisting users
		const pageId = await Users.exists(
			{ email }
			//{ _id: 1, documentPageId: 1 }
		)
			.limit(1)
			.lean()
			.exec();
		//debug(`pageId: ${JSON.stringify(pageId)}`);
		if (!pageId) {
			return json(
				{
					message: 'User not valid'
				},
				{
					status: 409
				}
			);
		}

		if (action === 'new') {
			const userUpdate = await Users.updateOne(
				{ email },
				{
					$push: {
						uploadfiles: {
							type,
							filename: fileName
						}
					}
				}
			)
				.limit(1)
				.lean()
				.exec();
			//debug(`userUpdate pic new: ${JSON.stringify(userUpdate)}`);
			//console.log('userUpdate photo', userUpdate)
			if (userUpdate.modifiedCount == 1) {
				return json(
					{
						message: `User pic ${type} updated`
					},
					{
						status: 200
					}
				);
			}
		}

		if (action === 'delete') {
			const userUpdate = await Users.updateOne(
				{ email },
				{
					$pull: {
						uploadfiles: {
							type,
							filename: fileName
						}
					}
				}
			)
				.limit(1)
				.lean()
				.exec();
			if (userUpdate.modifiedCount == 1) {
				//console.log('userUpdate', userUpdate)
				return json(
					{
						message: `User pic ${type} deleted`
					},
					{
						status: 200
					}
				);
			}
		}

		// general error update
		return json(
			{
				message: 'User pic update error'
			},
			{
				status: 500
			}
		);

	} catch (err) {
		console.log('User pic update ERROR:', err);
		return json(
			{
				message: 'User pic update Failed'
			},
			{
				status: 500
			}
		);
	}
};
