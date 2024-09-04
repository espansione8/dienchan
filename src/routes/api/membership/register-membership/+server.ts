import { json as json$1 } from '@sveltejs/kit';
// src/routes/api/auth/sign-up.js
import stringHash from 'string-hash';
import { serialize } from 'cookie';
import dbConnect from '$lib/database';
import { Membership } from '$lib/models/Membership.model';
import { File } from 'nft.storage';

export const POST = async ({ request }) => {
	const body = await request.json();
	// const productUserId = body.productUserId;
	const title = body.titolo;
	const descrLong = body.descrizione;
	const status = body.status;
	const cost = body.prezzo;
	const duration = body.durata;

	const itemArrayPrimary = [];
	const itemArrayGallery = [];
	const uploadfiles = [];
	const array = body.payloadArray;

	try {
		// Connecting to DB
		// All database code can only run inside async functions as it uses await
		await dbConnect();
		// Is there a user with such an email?

		// Add user to DB
		// All database code can only run inside async functions as it uses await
		// const uUID = crypto.randomUUID();

    // const findMembershipId = await Membership.exists(
		// 	{ membershipId: uUID }
		// 	//{ _id: 1, documentPageId: 1 }
		// )
		// 	.limit(1)
		// 	.lean()
		// 	.exec();
		// if (findMembershipId) {
		// 	return json$1(
		// 		{
		// 			message: 'QR Page conflict'
		// 		},
		// 		{
		// 			status: 500
		// 		}
		// 	);
		// }
		async function isMembershipIdExists(membershipId) {
			return await Membership.exists({ membershipId: membershipId })
			.limit(1)
			.lean()
			.exec();
		}
    // async function generateUniqueCode() {
    //   let uUID;
    //   let isDuplicate;

    //   do {
    //       uUID = await crypto.randomUUID();
    //       isDuplicate = await isMembershipIdExists(uUID);
    //   } while (isDuplicate);

    //   return uUID;
    // }

    let isDuplicate;
    let uUID;
    let attempts = 0; 
    do {
		attempts++;
		uUID = await crypto.randomUUID();
		isDuplicate = await isMembershipIdExists(uUID);
    //   console.log('attempts',attempts);
    //   console.log('isDuplicate',isDuplicate);
		if (attempts >= 10) {
				// throw new Error("Errore: Numero massimo di tentativi raggiunto");
				console.log("Errore: Numero massimo di tentativi raggiunto");
				
				return json$1(
					{
							message: 'Registrazione fallita, ritentare'
					},
					{
							status: 500
					}
				);
			}
    } while(attempts < 10 && isDuplicate)


		const newMembership = new Membership();
		newMembership.membershipId = uUID;
		newMembership.title = title;
		newMembership.membershipLevel = title;
		newMembership.descrLong = descrLong;
		newMembership.status = status;
		newMembership.cost = cost;
		newMembership.duration = duration;

		await array.forEach((item) => {
			// console.log('item.type', item.type );
			
			// const encodedNew = Buffer.from(item.base64, 'base64');
			// const docfiles = new File([encodedNew], item.filename);
			// console.log('forEach docfiles: ', docfiles);
			// uploadfiles.push({ filename: item.filename, type: item.type, fileUrl:'' });
			// itemArray.push(docfiles);
			if(item.type === 'primary'){
				const encodedNewPrimary = Buffer.from(item.base64, 'base64');
				const docfilesPrimary = new File([encodedNewPrimary], item.filename);
				// console.log('forEach docfiles: ', docfilesPrimary);
				uploadfiles.push({ filename: item.filename, type: 'membership-primary', fileUrl:`${import.meta.env.VITE_UPLOAD_IMAGE_URL}/files/memberships/${newMembership.membershipId}/membership-primary/${item.filename}` });
				itemArrayPrimary.push(docfilesPrimary);
			}
	
			if(item.type === 'gallery'){
				// console.log('item.type gallery', item );
				const encodedNewGallery = Buffer.from(item.base64, 'base64');
				const docfilesGallery = new File([encodedNewGallery], item.filename);
				// console.log('forEach docfiles: ', docfilesGallery);
				uploadfiles.push({ filename: item.filename, type: 'membership-gallery', fileUrl:`${import.meta.env.VITE_UPLOAD_IMAGE_URL}/files/memberships/${newMembership.membershipId}/membership-gallery/${item.filename}` });
				itemArrayGallery.push(docfilesGallery);
			}
		});
		newMembership.uploadfiles = await [... uploadfiles]
		// newMembership.image1 = `${import.meta.env.VITE_UPLOAD_IMAGE_URL}/product/${newMembership.prodId}/`;
		
		// console.log('payloadArray', body.payloadArray);
		// console.log('itemArray', itemArray);
		// await console.log('newMembership', newMembership);
		
		await newMembership
			.save()
			.then(async (res) => {
			})
      // .catch(console.error);
			.catch((error) => {
          console.error(error);
          return json$1(
              {
                  message: 'Inserimento quota fallita'
              },
              {
                  status: 500
              }
          );
      });
			
		////POST file upload//////
		//// membership-primary ////
		const formFilePrimary = new FormData();
		formFilePrimary.set('directory', `memberships/${newMembership.membershipId}/membership-primary`);
		itemArrayPrimary.forEach((item) => {
			formFilePrimary.append('payloadArray', item);
		});
		const responseFilePrimary = await fetch(`${import.meta.env.VITE_UPLOAD_IMAGE_URL}`, {
			method: 'POST',
			// headers: {
			// 	'x-api-key': '6139e718-e1ba-4a1a-b36a-5c2fa664df45'
			// },
			body: formFilePrimary
		});
		const resFilePrimary = await responseFilePrimary.json();
		console.log('resFilePrimary UPLOAD response', resFilePrimary);

		///// membership-gallery ////
		const formFileGallery = new FormData();
		formFileGallery.set('directory', `memberships/${newMembership.membershipId}/membership-gallery`);
		itemArrayGallery.forEach((item) => {
			formFileGallery.append('payloadArray', item);
		});
		const responseFileGallery = await fetch(`${import.meta.env.VITE_UPLOAD_IMAGE_URL}`, {
			method: 'POST',
			// headers: {
			// 	'x-api-key': '6139e718-e1ba-4a1a-b36a-5c2fa664df45'
			// },
			body: formFileGallery
		});
		const resFileGallery = await responseFileGallery.json();
		console.log('resFileGallery UPLOAD response', resFileGallery);
		//resFile UPLOAD response { filesUpload: 'ok' }
		///// END file upload


		// Set cookie
		// If you want cookies to be passed alongside user when they redirect to another website using a link, change sameSite to 'lax'
		// If you don't want cookies to be valid everywhere in your app, modify the path property accordingly
		// const headers = {
		// 	'Set-Cookie': serialize('session_id', cookieId, {
		// 		httpOnly: true,
		// 		maxAge: 60 * 60 * 24 * 7, // one week
		// 		sameSite: 'strict',
		// 		path: '/'
		// 	})
		// };
    const findId = await Membership.find({_id: newMembership._id});
    // console.log('111111111111', findId);
    if (findId.length > 0) {
      return json$1(
        {
          message: "Membro aggiunto"
        },
        {
          status: 200
        }
      );
    } else {
      // console.log('Nope');
      return json$1(
        {
          message: 'Inserimento membro nuovo fallito'
        },
        {
          status: 500
        }
      );
    }
		
	} catch (err) {
		console.log('Prodotto ERROR:', err);
		return json$1(
			{
				message: 'Prodotto registrazione fallita'
			},
			{
				status: 500
			}
		);
	}
};
