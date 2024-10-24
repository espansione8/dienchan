import { writable } from 'svelte/store';
//import axios from 'axios';

const initial: any = false
export const thisProd = writable(initial);
export const imagesArray = writable(initial);
export const relatedProd = writable(initial);
export const isFetching = writable(initial);

export async function getThisProd(prodId) {
	isFetching.set(true);
	try {
		//const responseProd = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/product/findId/${prodId}`);
		const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/product/findId/${prodId}`);
		const responseProd = await res.json();
		//console.log('responseProd', responseProd);

		////////////////////
		//const imageURL = (name) => `/api/images/${name.split('/').pop()}`;
		const slides: any = [
			responseProd.image1 === 'false' ? false : responseProd.image1,
			responseProd.image2 === 'false' ? false : responseProd.image2,
			responseProd.image3 === 'false' ? false : responseProd.image3,
			responseProd.image4 === 'false' ? false : responseProd.image4,
			responseProd.image5 === 'false' ? false : responseProd.image5,
			responseProd.image6 === 'false' ? false : responseProd.image6,
			responseProd.image7 === 'false' ? false : responseProd.image7,
			responseProd.image8 === 'false' ? false : responseProd.image8,
			//!!responseProd.image8 && imageURL(responseProd.image8)
		];
		///////////////////
		thisProd.set(responseProd);
		imagesArray.set(slides);
		if (responseProd.category.length > 0) {
			//console.log('slides', slides);
			//const categoryArray = responseProd.data.category.reverse();
			const categoryArray = responseProd.category;
			const categoryId = categoryArray[1] || categoryArray[0];
			// const responseProdRelated = await axios.get(
			// 	`${import.meta.env.VITE_BASE_URL}/api/product/related/${categoryId}`
			// );
			const responseProdRelated = await fetch(
				`${import.meta.env.VITE_BASE_URL}/api/product/related/${categoryId}`
			);
			const valueSet = await responseProdRelated.json()
			relatedProd.set(valueSet);
		}
	} catch (error) {
		console.error(error);
	} finally {
		isFetching.set(false);
	}
}