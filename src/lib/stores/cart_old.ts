import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const storedCart = JSON.parse(browser && localStorage.getItem('cartProducts')) || [];
export const cartProducts = writable(browser && storedCart);
cartProducts.subscribe(
	(val) => browser && localStorage.setItem('cartProducts', JSON.stringify(val))
);

const cartData = JSON.parse(browser && localStorage.getItem('cdata')) || { q1: 0, p1: 0 };
export const cdata = writable(browser && cartData);
cdata.subscribe((val) => browser && localStorage.setItem('cdata', JSON.stringify(val)));

export const cartStatus = writable(0);

export const addtoCart = async (cart, item, openCart) => {
	let newCart = [];
	if (openCart) {
		cartStatus.set(Math.random());
	}
	//cartTotalQuantity.update(n => n + 1);
	// const checkParamType = Object.values(listAPI).includes(queryParam);
	const idList = cart.map((cartItem) => cartItem.prodId);
	const checkProduct = idList.includes(item.prodId);
	//console.log('idList', idList);
	if (checkProduct) {
		//console.log('existing item', item.prodId);
		newCart = cart.map((prod) => {
			if (prod.prodId === item.prodId) {
				const quantity = prod.orderQuantity;
				prod.orderQuantity = quantity + 1;
				return prod;
			} else {
				return prod;
			}
		});
		//console.log('newCart', newCart);
		cartProducts.set(newCart);
	} else {
		//console.log('add item', item.prodId);
		item.orderQuantity = 1;
		newCart = [item, ...cart];
		cartProducts.set(newCart);
		// cartProducts.update(product => {
		//     return [item, ...product];
		// });
	}

	cdata.update((obj) => {
		const newObj = { ...obj };
		let newPts = 0;
		newCart.forEach((cartItem) => {
			const pointCalc = cartItem.orderQuantity * cartItem.points;
			newPts += pointCalc;
		});
		newObj.q1++;
		newObj.p1 = newPts;
		//console.log('obj', obj);
		//console.log('newObj', newObj);
		return newObj;
	});
};

export const removeFromCart = async (cart, item) => {
	let newCart = [];
	//cartTotalQuantity.update(n => n > 0 ? n - 1 : n = 0);
	//console.log('remove cart', JSON.stringify(cart));
	const thisItem = cart.filter((prod) => {
		return prod.prodId === item.prodId;
	});
	//console.log('thisItem', thisItem[0].orderQuantity);
	if (thisItem[0].orderQuantity > 1) {
		//console.log('existing item > 1', item.prodId);
		newCart = cart.map((prod) => {
			if (prod.prodId === item.prodId) {
				const quantity = prod.orderQuantity;
				prod.orderQuantity = quantity - 1;
				return prod;
			} else {
				return prod;
			}
		});
		//console.log('newCart', newCart);
		cartProducts.set(newCart);
	} else {
		//console.log('last item', item.prodId, item.NAME);
		newCart = cart.filter((prod) => {
			return prod.prodId !== item.prodId;
		});
		//console.log('filter', filter);
		cartProducts.set(newCart);
	}

	cdata.update((obj) => {
		const newObj = { ...obj };
		let newPts = 0;
		newCart.forEach((cartItem) => {
			const pointCalc = cartItem.orderQuantity * cartItem.points;
			newPts += pointCalc;
		});
		obj.q1 > 0 ? newObj.q1-- : (newObj.q1 = 0);
		newObj.p1 = newPts;
		//console.log('obj', obj);
		//console.log('newObj', newObj);
		return newObj;
	});
};

export const cartSendOrder = () => {
	cartProducts.set([]);
	//cartTotalQuantity.set(0);
	cdata.set({ q1: 0, p1: 0 });
};
