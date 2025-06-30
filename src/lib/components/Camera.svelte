<script lang="ts">
	import { onMount, onDestroy } from 'svelte'; // Import onDestroy for proper stream cleanup
	import { classifyImage } from './classifier';

	// Bindings for DOM elements
	let videoSource: HTMLVideoElement | null = null;
	let canvasElement: HTMLCanvasElement | null = null;
	let canvasContext: CanvasRenderingContext2D | null = null; // Store the 2D context

	// State variables
	let loading = false;
	let cameraActive = false; // To track if camera is streaming
	let errorMessage: string | null = null; // For displaying errors
	let capturedImage: string | null = null; // To store the captured image data URL
	let predictions: any[] = []; // To store predictions if needed

	// Stores the MediaStream object to be able to stop it later
	let currentStream: MediaStream | null = null;

	const getCamera = async (): Promise<void> => {
		errorMessage = null; // Clear previous errors
		loading = true;
		try {
			let stream: MediaStream;
			try {
				// Try to get the environment (back) camera
				stream = await navigator.mediaDevices.getUserMedia({
					video: { facingMode: { exact: 'environment' } }
				});
			} catch (e) {
				// Fallback: get any available camera if environment is not found
				stream = await navigator.mediaDevices.getUserMedia({
					video: true
				});
			}
			currentStream = stream; // Store the stream for cleanup

			if (videoSource) {
				videoSource.srcObject = stream;
				// Wait for the video to load metadata to get its dimensions
				videoSource.onloadedmetadata = () => {
					if (videoSource) {
						// Check again in case component unmounted
						videoSource.play();
						cameraActive = true;
					}
				};
			} else {
				errorMessage = 'Video element not found. Please refresh.';
				console.error('Video element is null, cannot set srcObject.');
			}
		} catch (error: any) {
			// Type 'any' for error for flexibility in catching different error types
			console.error('Error accessing camera:', error);
			if (error.name === 'NotAllowedError') {
				errorMessage =
					'Camera access denied. Please allow permissions in your browser settings.';
			} else if (error.name === 'NotFoundError') {
				errorMessage =
					'No camera found. Please ensure a camera is connected.';
			} else {
				errorMessage = `Error starting camera: ${error.message}`;
			}
			cameraActive = false;
		} finally {
			loading = false;
		}
	};

	const stopCamera = (): void => {
		if (currentStream) {
			currentStream.getTracks().forEach((track) => track.stop());
			currentStream = null;
		}
		if (videoSource) {
			videoSource.srcObject = null;
		}
		cameraActive = false;
		// Optionally clear captured image when stopping camera
		capturedImage = null;
	};

	const captureImage = (): void => {
		if (!videoSource || !cameraActive || !canvasElement) {
			errorMessage =
				'Camera not active or elements not ready for capture.';
			console.warn(
				'Attempted to capture without active video or canvas.'
			);
			return;
		}

		// Ensure we have a 2D context
		if (!canvasContext) {
			canvasContext = canvasElement.getContext('2d');
			if (!canvasContext) {
				errorMessage = 'Could not get canvas 2D context.';
				console.error('Failed to get canvas 2D context.');
				return;
			}
		}

		// Set canvas dimensions to match the video's actual dimensions
		canvasElement.width = videoSource.videoWidth;
		canvasElement.height = videoSource.videoHeight;

		// Draw the current frame of the video onto the canvas
		canvasContext.drawImage(
			videoSource,
			0,
			0,
			canvasElement.width,
			canvasElement.height
		);

		// Get the image data as a PNG data URL
		capturedImage = canvasElement.toDataURL('image/png'); // Can also be 'image/jpeg'
		errorMessage = null; // Clear error on successful capture
	};

	$: if (capturedImage) {
		// Run your function here when capturedImage changes and is not null
		if (captureImage != null) {
			// Create a new HTMLImageElement
			const img = new Image();

			img.onload = () => {
				classifyImage(img)
					.then((result) => {
						predictions = result.classes;
					})
					.catch((err) => {
						console.error('Error classifying image:', err);
					});
			};
			img.src = capturedImage;
		}
	}

	const clearCapturedImage = (): void => {
		capturedImage = null;
		if (canvasContext && canvasElement) {
			canvasContext.clearRect(
				0,
				0,
				canvasElement.width,
				canvasElement.height
			);
		}
	};

	onMount(() => {
		getCamera();
	});

	// Cleanup: Stop the camera stream when the component is destroyed
	onDestroy(() => {
		stopCamera();
	});
</script>

<div class="camera-container">
	{#if loading}
		<p>LOADING CAMERA...</p>
	{/if}

	{#if errorMessage}
		<p class="error-message">{errorMessage}</p>
	{/if}
	<!-- svelte-ignore a11y-media-has-caption -->
	<video
		bind:this={videoSource}
		autoplay
		playsinline
	></video>

	<div class="controls">
		{#if !cameraActive && !loading}
			<button on:click={getCamera}>Start Camera</button>
		{:else if cameraActive}
			<button
				on:click={captureImage}
				disabled={!cameraActive}>Capture Image</button
			>
			<button on:click={stopCamera}>Stop Camera</button>
		{/if}
	</div>

	<canvas bind:this={canvasElement}></canvas>

	{#if predictions.length}
		<h1 style="text-align: left; width: 100%; margin: 0 0 0.5em 0;">
			<b>Predictions</b>
		</h1>
		<ul style="width: 100%; list-style: none; padding: 0; margin: 0;">
			{#each predictions as classification}
				<li
					style="display: flex; justify-content: space-between; align-items: center; padding: 0.5em 0; width: 100%;"
				>
					<span style="text-align: left;"
						>{classification.className}</span
					>
					<span style="text-align: right;"
						>{classification.score}</span
					>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.camera-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 15px;
		padding: 20px;
		border: 1px solid #ccc;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		max-width: 800px;
		margin: 20px auto;
		background-color: #f9f9f9;
	}

	video {
		width: 100%;
		max-width: 640px; /* Max width for consistency */
		height: auto;
		border: 2px solid #007bff;
		background-color: #000; /* Black background for video placeholder */
		display: block;
		border-radius: 5px;
	}

	button {
		padding: 10px 20px;
		border: none;
		border-radius: 5px;
		background-color: #007bff;
		color: white;
		cursor: pointer;
		font-size: 16px;
		transition: background-color 0.2s ease;
	}

	button:hover {
		background-color: #0056b3;
	}

	button:disabled {
		background-color: #cccccc;
		cursor: not-allowed;
	}

	.controls {
		display: flex;
		gap: 10px;
		margin-top: 10px;
	}

	.error-message {
		color: red;
		font-weight: bold;
		margin-top: 10px;
	}

	/* Hidden canvas */
	canvas {
		display: none; /* Keep the canvas hidden as it's just for drawing */
	}
</style>
