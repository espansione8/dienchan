<!-- src/routes/(dashboard)/dashboard/report/+page.svelte -->
<!--
	Report page: monthly sales report.
	- Columns: one per month of the selected year.
	- Rows: Numero corsi / Incassi corsi / Numero Altro / Incassi Altro.
	- Only "confirmed" orders are counted, see +page.server.ts for the aggregation.
	- Use the arrows next to the year to move between years; this updates the "year" query param and reruns the load.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	let { data } = $props();
	const { monthlyReport, totals, selectedYear } = $derived(data);

	const changeYear = (year: number) => {
		goto(`?year=${year}`);
	};

	const formatCurrency = (value: number) => `€ ${value.toFixed(2)}`;
</script>

<svelte:head>
	<title>Report</title>
</svelte:head>

<noscript>
	<h1 style="font-weight:700; text-align: center;">Please enable Javascript to continue.</h1>
	<style type="text/css">
		#main-content {
			display: none;
		}
	</style>
</noscript>

<div id="main-content" class="overflow-x-auto mt-5 px-4 mb-5">
	<div class="flex flex-col gap-4 mb-4">
		<h1 class="text-2xl font-bold text-gray-700 text-center mb-4">Report Vendite Mensili</h1>
		<div class="flex justify-center items-center gap-4">
			<button class="btn btn-info btn-sm text-white" onclick={() => changeYear(selectedYear - 1)}>
				<ChevronLeft />
			</button>
			<span class="text-xl font-semibold">{selectedYear}</span>
			<button class="btn btn-info btn-sm text-white" onclick={() => changeYear(selectedYear + 1)}>
				<ChevronRight />
			</button>
		</div>
	</div>

	<table class="table mt-5 bg-white border-2">
		<!-- head -->
		<thead class="text-base italic bg-info text-accent">
			<tr>
				<th class="sticky left-0 z-10 bg-info shadow-[4px_0_6px_-4px_rgba(0,0,0,0.3)]">Mese</th>
				{#each monthlyReport as m (m.monthNum)}
					<th class="text-center">{m.label}</th>
				{/each}
				<th class="text-center">Totale</th>
			</tr>
		</thead>
		<!-- body -->
		<tbody>
			<tr class="group hover:bg-gray-100">
				<th class="sticky left-0 z-10 bg-white group-hover:bg-gray-100 shadow-[4px_0_6px_-4px_rgba(0,0,0,0.15)]">Numero corsi</th>
				{#each monthlyReport as m (m.monthNum)}
					<td class="text-center">{m.courseCount}</td>
				{/each}
				<td class="text-center font-bold">{totals.courseCount}</td>
			</tr>
			<tr class="group hover:bg-gray-100">
				<th class="sticky left-0 z-10 bg-white group-hover:bg-gray-100 shadow-[4px_0_6px_-4px_rgba(0,0,0,0.15)]">Incassi corsi</th>
				{#each monthlyReport as m (m.monthNum)}
					<td class="text-center">{formatCurrency(m.courseIncome)}</td>
				{/each}
				<td class="text-center font-bold">{formatCurrency(totals.courseIncome)}</td>
			</tr>
			<tr class="group hover:bg-gray-100">
				<th class="sticky left-0 z-10 bg-white group-hover:bg-gray-100 shadow-[4px_0_6px_-4px_rgba(0,0,0,0.15)]">Numero Altro</th>
				{#each monthlyReport as m (m.monthNum)}
					<td class="text-center">{m.otherCount}</td>
				{/each}
				<td class="text-center font-bold">{totals.otherCount}</td>
			</tr>
			<tr class="group hover:bg-gray-100">
				<th class="sticky left-0 z-10 bg-white group-hover:bg-gray-100 shadow-[4px_0_6px_-4px_rgba(0,0,0,0.15)]">Incassi Altro</th>
				{#each monthlyReport as m (m.monthNum)}
					<td class="text-center">{formatCurrency(m.otherIncome)}</td>
				{/each}
				<td class="text-center font-bold">{formatCurrency(totals.otherIncome)}</td>
			</tr>
		</tbody>
	</table>
</div>
