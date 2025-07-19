	let orderDetail = $state(tableList[0]);

	const csvCreate = () => {
		const flattenObject = (obj: any, prefix = '') => {
			return Object.keys(obj).reduce((acc, k) => {
				const pre = prefix.length ? prefix + '_' : '';
				if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
					Object.assign(acc, flattenObject(obj[k], pre + k));
				} else {
					// Only include non-array, non-object values in the final flat object
					if (!Array.isArray(obj[k])) {
						acc[pre + k] = obj[k];
					}
				}
				return acc;
			}, {});
		};

		const dataToExport = tableList.map((order) => {
			const flatOrder = flattenObject(order);

			// Format dates and remove unwanted keys in a single pass
			if (flatOrder.createdAt) flatOrder.createdAt = (flatOrder.createdAt as string).substring(0, 10);
			if (flatOrder.birthdate) flatOrder.birthdate = (flatOrder.birthdate as string).substring(0, 10);

			$orderKeysToDelete.forEach((key: string) => delete (flatOrder as any)[key]);
			return flatOrder;
		});

		//CSV UNPARSE
		const csv = Papa.unparse(dataToExport, {
			quotes: false, //or array of booleans
			quoteChar: '"',
			escapeChar: '"',
			delimiter: ';',
			header: true,
			skipEmptyLines: false //other option is 'greedy', meaning skip delimiters, quotes, and whitespace.
		});

		//DOWNLOAD file
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });

        const link = document.createElement('a');
		const url = URL.createObjectURL(blob);
		link.href = url;

		const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
		link.download = `Export_Orders_${today}.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);


