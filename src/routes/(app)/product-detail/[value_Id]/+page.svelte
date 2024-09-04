<script lang="ts">
	let { data } = $props();
	let { getProduct } = $derived(data);
</script>

<div class="section">
	<div class="container">
		<div class="row">
			<div class="col-sm-3">
				<h1>DA FARE</h1>
				<div
					id="carouselExampleIndicators"
					class="carousel slide m-3"
					data-bs-ride="carousel"
					style=""
				>
					<div class="carousel-indicators">
						<button
							type="button"
							data-bs-target="#carouselExampleIndicators"
							data-bs-slide-to="0"
							class="active"
							aria-current="true"
							aria-label="Slide 1"
						></button>
						<button
							type="button"
							data-bs-target="#carouselExampleIndicators"
							data-bs-slide-to="1"
							aria-label="Slide 2"
						></button>
						<button
							type="button"
							data-bs-target="#carouselExampleIndicators"
							data-bs-slide-to="2"
							aria-label="Slide 3"
						></button>
					</div>
					<div class="carousel-inner">
						<div class="carousel-item active" data-bs-interval="">
							<img src="/images/no_img.jpg" class="d-block w-100" alt="..." />
						</div>
						<div class="carousel-item" data-bs-interval="">
							<img src="/images/no_img.jpg" class="d-block w-100" alt="..." />
						</div>
						<div class="carousel-item" data-bs-interval="">
							<img src="/images/no_img.jpg" class="d-block w-100" alt="..." />
						</div>
					</div>
					<button
						class="carousel-control-prev"
						type="button"
						data-bs-target="#carouselExampleIndicators"
						data-bs-slide="prev"
					>
						<span class="carousel-control-prev-icon" aria-hidden="true"></span>
						<span class="visually-hidden">Previous</span>
					</button>
					<button
						class="carousel-control-next"
						type="button"
						data-bs-target="#carouselExampleIndicators"
						data-bs-slide="next"
					>
						<span class="carousel-control-next-icon" aria-hidden="true"></span>
						<span class="visually-hidden">Next</span>
					</button>
				</div>
			</div>
			<div class="col-sm-9">
				<div class="card m-3" style="">
					<div class="card-body">
						<h5 class="card-title">{getProduct.title}</h5>
						<p class="card-text" style="white-space: pre-line;">{getProduct.descrLong}</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
