<script lang="ts">
	import Notification from '$lib/components/Notification.svelte';
	import { invalidateAll } from '$app/navigation';
	import {
		SquareX,
		CloudUpload,
		Pen,
		Users,
		Building2,
		Send,
		List,
		Calculator,
		FileDown
	} from 'lucide-svelte';

	let { data } = $props();
	let { userData, getProduct } = $derived(data);
	let fileInput = $state();
	let files = $state();
	let filesJpgPrimary = $state([]);
	let payloadProductPrimaryArray = $state([]);
	let filesJpgArray = $state([]);
	let payloadArray = $state([]);
	let productFiles = $state(getProduct.uploadfiles);

	let findProductPrimary = $state(
		productFiles.filter((file: any) => file.type === 'product-primary')
	);

	let findProductGallery = $state(
		productFiles.filter((file: any) => file.type === 'product-gallery')
	);

	let error = $state();
	const product_id = $state(getProduct._id);
	let productTitolo = $state(getProduct.title);
	let productDescrizione = $state(getProduct.descrLong);
	let productUserId = $state(userData.userId);
	let productStatus = $state(getProduct.status);
	let productCategoria = $state(getProduct.category);
	// let productElencoTag = [];
	// let productInputTag = '';
	let productQuantita = $state(getProduct.stockQty);
	// let productInputEmailNotifica = '';
	let productCost = $state(getProduct.cost);
	let productProdId = $state(getProduct.prodId);
	// $: productUploadfiles = getProduct.uploadfiles;
	let productUploadfiles = $state(getProduct.uploadfiles);

	async function submitForm(event: any) {
		error = null;
		const data = {
			product_id,
			productUserId,
			productTitolo,
			productDescrizione,
			productStatus,
			productQuantita,
			productCategoria,
			// productElencoEmailNotifica,
			// productCorsoElencoTag,
			productCost,
			productProdId,
			productUploadfiles
		};
		data['payloadArray'] = payloadArray;
		const response = await fetch(`/api/products/change`, {
			method: 'POST',
			body: JSON.stringify(data),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (response.ok) {
			filesJpgPrimary = [];
			filesJpgArray = [];
			payloadArray = [];
			clearTimeout(startTimeout);
			console.log('OK', response);
			let content = (await response.json()).message;
			toastClosed = false;
			invalidateAll();
			notificationContent = content;
			closeNotification();
		}
		if (response.status != 200) {
			console.log('KO', response);
			let error = (await response.json()).message;
			toastClosed = false;
			notificationContent = error;
			notificationError = true;
			closeNotification();
		}
	}

	let primaryCheck = $state(false);
	const onPrimaryCheck = (array: any) => {
		array.forEach((element: any) => {
			// const checkJpg = imageTypes.includes(element.type);

			const checkJpg =
				element.includes('.jpeg') ||
				element.includes('.jpg') ||
				element.includes('.JPEG') ||
				element.includes('.JPG') ||
				element.includes('.png') ||
				element.includes('.PNG');
			if (!checkJpg) {
				primaryCheck = false;
			} else {
				primaryCheck = true;
			}
		});
	};

	let jpgCheck = $state(false);
	const onJpgCheck = (array: any) => {
		array.forEach((element: any) => {
			// const checkJpg = imageTypes.includes(element.type);

			const checkJpg =
				element.includes('.jpeg') ||
				element.includes('.jpg') ||
				element.includes('.JPEG') ||
				element.includes('.JPG') ||
				element.includes('.png') ||
				element.includes('.PNG');
			if (!checkJpg) {
				jpgCheck = false;
			} else {
				jpgCheck = true;
			}
		});
	};

	const getBase64 = (image: any, type: any) => {
		//console.log('image name', image.name);
		const name = image.name;
		const nameJpgCheck =
			name.slice(-4) === '.jpg' ||
			name.slice(-5) === '.jpeg' ||
			name.slice(-4) === '.JPG' ||
			name.slice(-5) === '.JPEG' ||
			name.slice(-4) === '.png' ||
			name.slice(-4) === '.PNG';

		onJpgCheck(filesJpgArray);
		onPrimaryCheck(filesJpgPrimary);

		if (type === 'primary') {
			if (!nameJpgCheck) {
				let error = 'Upload JPG Error: Uploaded file is not a JPG 0.1';
				toastClosed = false;
				notificationContent = error;
				notificationError = true;
				closeNotification();
			} else {
				const reader = new FileReader();
				reader.readAsDataURL(image);
				reader.onload = (e) => {
					if (primaryCheck || filesJpgPrimary.length === 0) {
						const checkFileInArray = filesJpgPrimary.includes(name);
						if (checkFileInArray || filesJpgPrimary.length > 0) {
							let error =
								'Upload JPG Error: File already Selected, delete the current one to Upload again';
							toastClosed = false;
							notificationContent = error;
							notificationError = true;
							closeNotification();
						} else {
							filesJpgPrimary.push(image.name);
							filesJpgPrimary = filesJpgPrimary;
							//console.log('filesJpgPrimary', filesJpgPrimary);
							// no upload, make array
							//uploadFunction(e.target.result, name);
							const raw64 = e.target.result;
							const clean64 = raw64.split(',');
							payloadArray.push({ filename: image.name, base64: clean64[1], type });
							payloadArray = payloadArray;
							//console.log('payloadArray', payloadArray);
						}
					} else {
						let error = 'Upload JPG Error: Uploaded file is not a JPG 0.2';
						toastClosed = false;
						notificationContent = error;
						notificationError = true;
						closeNotification();
					}
				};
			}
		} else if (type === 'gallery') {
			if (!nameJpgCheck) {
				let error = 'Upload JPG Error: Uploaded file is not a JPG 0.1';
				toastClosed = false;
				notificationContent = error;
				notificationError = true;
				closeNotification();
			} else {
				const reader = new FileReader();
				reader.readAsDataURL(image);
				reader.onload = (e) => {
					if (jpgCheck || filesJpgArray.length === 0) {
						const checkFileInArray = filesJpgArray.includes(name);
						// console.log('filesJpgArray.length',filesJpgArray.length);
						// console.log('filesJpgArray',filesJpgArray);
						if (checkFileInArray) {
							let error =
								'Upload JPG Error: Same name file already Selected, delete the current one to Upload again';
							toastClosed = false;
							notificationContent = error;
							notificationError = true;
							closeNotification();
						} else if (filesJpgArray.length > 7) {
							// NOTA: non calcola il primo file caricato
							let error =
								'Upload JPG Error: All 8 slot files already selected, delete the current one to Upload again';
							toastClosed = false;
							notificationContent = error;
							notificationError = true;
							closeNotification();
						} else {
							filesJpgArray.push(image.name);
							filesJpgArray = filesJpgArray;
							//console.log('filesJpgArray', filesJpgArray);
							// no upload, make array
							//uploadFunction(e.target.result, name);
							const raw64 = e.target.result;
							const clean64 = raw64.split(',');
							payloadArray.push({ filename: image.name, base64: clean64[1], type });
							payloadArray = payloadArray;
							//console.log('payloadArray', payloadArray);
						}
					} else {
						let error = 'Upload JPG Error: Uploaded file is not a JPG 0.2';
						toastClosed = false;
						notificationContent = error;
						notificationError = true;
						closeNotification();
					}
				};
			}
		} else {
			alert('File select error');
		}
	};

	const deleteFunctionPrimary = async (fileName) => {
		const arrayIndex = filesJpgPrimary.indexOf(fileName);
		filesJpgPrimary.splice(arrayIndex, 1);
		filesJpgPrimary = filesJpgPrimary;
		const arrayJpgIndexPayload = payloadProductPrimaryArray
			.map((element) => element.filename)
			.indexOf(fileName);
		payloadArray.splice(arrayJpgIndexPayload, 1);
		payloadArray = payloadArray;
		// payloadProductPrimaryArray.splice(arrayJpgIndexPayload, 1);
		// payloadProductPrimaryArray = payloadProductPrimaryArray;
	};

	const deleteFunctionGalleryJPG = async (fileName) => {
		const arrayIndex = filesJpgArray.indexOf(fileName);
		filesJpgArray.splice(arrayIndex, 1);
		filesJpgArray = filesJpgArray;
		const arrayJpgIndexPayload = payloadArray.map((element) => element.filename).indexOf(fileName);
		payloadArray.splice(arrayJpgIndexPayload, 1);
		payloadArray = payloadArray;
	};

	let uploading = $state(false);
	const deleteFileProductPrimary = async (filename) => {
		uploading = true;
		const data = {
			reqtype: 'productPrimaryJPG',
			filename,
			doc: getProduct.prodId
		};
		const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/document-page/manage-file`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
				//'Content-Type': 'application/pdf'
				//Accept: 'application/pdf'
			},
			body: JSON.stringify(data)
		});
		const response = await res.json();
		if (res.ok && response.deleted) {
			// getProduct = getProduct;
			invalidateAll();
			uploading = false;
		} else {
			//console.log('Errore res 1', res);
			alert(`Error: ${response.message}`);
		}
	};

	const deleteFilesProductGallery = async (uploadfilesType: any) => {
		uploading = true;
		const data = {
			reqtype: 'productGalleryJPG',
			uploadfilesType,
			doc: getProduct.prodId
		};
		const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/document-page/manage-file`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
				//'Content-Type': 'application/pdf'
				//Accept: 'application/pdf'
			},
			body: JSON.stringify(data)
		});
		const response = await res.json();
		if (res.ok && response.deleted) {
			// getProduct = getProduct;
			invalidateAll();
			uploading = false;
		} else {
			//console.log('Errore res 1', res);
			alert(`Error: ${response.message}`);
		}
	};

	// notification
	let toastClosed: boolean = $state(true);
	let notificationContent: string = $state('');
	let notificationError: boolean = $state(false);
	let startTimeout: any;
	const closeNotification = () => {
		startTimeout = setTimeout(() => {
			toastClosed = true;
		}, 3000); // 1000 milliseconds = 1 second
	};
	//clearTimeout(startTimeout); // reset timer
</script>

<form
	onsubmit={submitForm}
	class="grid grid-cols-4 bg-base-100 grid-rows-[min-content] gap-y-6 p-4 lg:gap-x-8 lg:p-8"
>
	<header class="col-span-4 text-center text-2xl font-bold text-green-800">
		Modifica Prodotto
	</header>
	<!-- Titolo -->
	<section class="col-span-4">
		<label for="titolo" class="form-label">
			<p class="font-bold mb-2">Titolo</p>
		</label>
		<div class="join join-horizontal rounded-md w-full">
			<button class="join-item bg-gray-300 px-3"><Pen /></button>
			<input
				class="input input-bordered join-item w-full"
				id="titolo"
				type="text"
				placeholder="Titolo"
				aria-label="Titolo"
				aria-describedby="basic-titolo"
				bind:value={productTitolo}
				required
			/>
		</div>
	</section>
	<!-- Descrizione -->
	<section class="col-span-4">
		<label for="descrizione" class="form-label">
			<p class="font-bold mb-2">Descrizione</p>
		</label>
		<div class="join join-horizontal rounded-md w-full">
			<button class="join-item bg-gray-300 px-3"><Pen /></button>
			<textarea
				class="textarea textarea-bordered h-24 join-item w-full"
				id="descrizione"
				placeholder="Descrizione"
				aria-label="descrizione"
				aria-describedby="basic-descrizione"
				bind:value={productDescrizione}
				required
			/>
		</div>
	</section>
	<!-- Quantità -->
	<section class="col-span-1 md:col-span-2">
		<label for="quantitaProdotto" class="form-label">
			<p class="font-bold mb-2">Quantità</p>
		</label>
		<div class="join join-horizontal rounded-md w-full">
			<button class="join-item bg-gray-300 px-3"><Users /></button>
			<input
				class="input input-bordered join-item w-full"
				id="quantitaProdotto"
				type="number"
				placeholder="N."
				aria-label="quantitaProdotto"
				aria-describedby="basic-quantitaProdotto"
				step="1"
				min="1"
				bind:value={productQuantita}
				required
			/>
		</div>
	</section>
	<!-- Categoria  -->
	<section class="col-span-4 md:col-span-2">
		<label for="category" class="form-label">
			<p class="font-bold mb-2">Categoria</p>
		</label>
		<div class="join join-horizontal rounded-md w-full">
			<button class="join-item bg-gray-300 px-3"><List /></button>
			<select
				class="select select-bordered w-full rounded-md rounded-l-none"
				id="category"
				aria-label="category"
				aria-describedby="basic-category"
				bind:value={productCategoria}
				required
			>
				<option selected disabled value="">Scegli</option>
				<option value="strumenti">Strumenti</option>
				<option value="materiali">Materiali</option>
			</select>
		</div>
	</section>
	<!-- Prezzo -->
	<section class="col-span-4 md:col-span-2">
		<label for="cost" class="form-label">
			<p class="font-bold mb-2">Prezzo</p>
		</label>
		<div class="join join-horizontal rounded-md w-full">
			<button class="join-item bg-gray-300 px-3"><Calculator /></button>
			<input
				class="input input-bordered join-item w-full"
				id="cost"
				type="number"
				placeholder="N."
				aria-label="cost"
				aria-describedby="basic-cost"
				step="0.50"
				min="1"
				bind:value={productCost}
				required
			/>
		</div>
	</section>
	<!-- upload immagine principale -->
	<section class="lg:col-span-4 mt-20">
		<h4 class="text-center text-lg font-bold text-gray-900">Immagine Principale</h4>
		<p class="text-center text-sm text-gray-600">(Solo un file)</p>
		<div class="mb-6">
			<div class="flex justify-center">
				<label class="btn btn-primary btn-lg rounded-lg mt-2 hover:text-white">
					<input
						type="file"
						name="file-to-upload"
						accept="image/png, image/jpeg"
						bind:files
						bind:this={fileInput}
						onchange={() => getBase64(files[0], 'primary')}
						onclick={(event) => (event.target.value = null)}
						class="hidden"
					/>
					<span class="flex items-center justify-center">
						<CloudUpload class="mr-2" />
						Carica JPG/PNG
					</span>
				</label>
			</div>
			<ul class="mt-6 list-none text-center">
				{#each filesJpgPrimary as element}
					<li class="mt-2">
						<button
							type="button"
							class="btn btn-error ml-6"
							onclick={() => deleteFunctionPrimary(element)}
						>
							<SquareX />
						</button>
						{element}
					</li>
				{/each}
			</ul>
		</div>
	</section>
	<!-- linea di separazione -->
	<div class="col-span-4 mx-auto border-t border-blue-700 w-96 mt-2" />
	<!-- upload immagine galleria -->
	<section class="lg:col-span-4">
		<h4 class="text-center text-lg font-bold text-gray-900">Immagini galleria</h4>
		<p class="text-center text-sm text-gray-600">
			(Seleziona i files uno alla volta) <br />
			Massimo 8 files
		</p>
		<div class="mb-6">
			<div class="flex justify-center">
				<label class="btn btn-primary btn-lg rounded-lg mt-2 hover:text-white">
					<input
						type="file"
						name="file-to-upload"
						accept=".jpg, .png"
						bind:files
						bind:this={fileInput}
						onchange={() => getBase64(files[0], 'gallery')}
						onclick={(event) => (event.target.value = null)}
						class="hidden"
					/>
					<span class="flex items-center justify-center">
						<CloudUpload class="mr-2" />
						{filesJpgArray.length > 0 ? `Carica Ancora JPG/PNG…` : `Carica JPG/PNG`}
					</span>
				</label>
			</div>
			<ul class="mt-6 list-none text-center">
				{#each filesJpgArray as element}
					<li class="mt-2">
						<button
							type="button"
							class="btn btn-error ml-6"
							onclick={() => deleteFunctionJPG(element)}
						>
							<SquareX />
						</button>
						{element}
					</li>
				{/each}
			</ul>
		</div>
	</section>
	<!-- registra prodotto button -->
	<div class="col-span-4 mt-10 flex justify-center">
		<button
			class="btn btn-success rounded-lg hover:bg-accent hover:text-green-800hover:bg-accent hover:text-green-900"
			type="submit"
		>
			<span class="flex items-center justify-center">
				<FileDown class="mr-2" />
				MODIFICA PRODOTTO
			</span>
		</button>
	</div>
</form>
<Notification {toastClosed} {notificationContent} {notificationError} />
