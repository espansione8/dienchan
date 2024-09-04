// src/routes/api/user/setAvatar
import { json as json$1 } from '@sveltejs/kit';
import dbConnect from '$lib/database';
import { Users } from '$lib/models/Users.model';
// import { File } from 'nft.storage';
//import QRCode from 'qrcode';

export const POST = async ({ request }) => {
	const body = await request.json();
	//console.log('body user', typeof body.userId, body.userId);

	//let itemsProcessed = 0;
	const itemArrayAvatar = [];
	const uploadfilesAvatar = [];
	const arrayAvatar = body.payloadAvatarArray;

	arrayAvatar.forEach((item) => {
		const encodedNew = Buffer.from(item.base64, 'base64');
		const docfiles = new File([encodedNew], item.filename);
		uploadfilesAvatar.push({ filename: item.filename, fileUrl: `${import.meta.env.VITE_UPLOAD_IMAGE_URL}/files/users/${body.dbId}/avatar/${item.filename}`, type: 'avatar' });
		itemArrayAvatar.push(docfiles);
		// callback after forEAch if
		// itemsProcessed++;
		// if (itemsProcessed === array.length) {
		// 	//// make matadata.json
		// 	console.log('matadata');
		// }
	});

	try {
		await dbConnect();

		const userId = await Users.exists(
			{ _id: body.dbId }
			//{ _id: 1, documentPageId: 1 }
		)
			.limit(1)
			.lean()
			.exec();
		if (!userId) {
			return json$1(
				{
					message: 'User not found'
				},
				{
					status: 500
				}
			);
		}

		const updateUser = await Users.updateOne(
			{ _id: body.dbId },
			{
				$set: {
					uploadfiles: [...uploadfilesAvatar],
					// userAvatar: `${import.meta.env.VITE_UPLOAD_IMAGE_URL}/users/${body.dbId}/avatar/${uploadfilesAvatar[0].filename}`
				}
			}
		)
			.lean()
			.exec();
		////POST file ID upload//////
		const formFileId = new FormData();
		// formFile.set('user', body.userId);
		formFileId.set('directory', `users/${body.dbId}/avatar`);
		itemArrayAvatar.forEach((item) => {
			console.log('iteArray obj', item);
			formFileId.append('payloadArray', item);
		});
		// const responseFileAvatar = await fetch(`https://files.riflessologiadienchan.it`, {
		const responseFileAvatar = await fetch(`${import.meta.env.VITE_UPLOAD_IMAGE_URL}`, {
			method: 'POST',
			// headers: {
			// 	'x-api-key': '6139e718-e1ba-4a1a-b36a-5c2fa664df45'
			// },
			body: formFileId
		});
		const resFileAvatar = await responseFileAvatar.json();
		console.log('resFile UPLOAD response', resFileAvatar);
		//resFile UPLOAD response { filesUpload: 'ok' }
		///// END file upload

		// console.log('newDoc', newDoc);
		//console.log('updateUser', updateUser);
		//if (data.filesUpload == 'ok') {
		if (updateUser.modifiedCount == 1) {
			return json$1(
				{
					message: 'Immagine profilo aggiornata'
				},
				{
					status: 200
				}
			);
		} else {
			return json$1(
				{
					message: 'Avatar Upload ERROR 001'
				},
				{
					status: 500
				}
			);
		}
		//};
	} catch (err) {
		console.log('Avatar Upload ERROR:', err);
		return json$1(
			{
				message: 'Avatar Upload ERROR 002'
			},
			{
				status: 500
			}
		);
	}
};

