// Import @tensorflow-models/tasks.
import * as tfTask from '@tensorflow-models/tasks';

let model: tfTask.ICCustomModelTFLite | null = null;

export async function loadClassifier() {
	model = await tfTask.ImageClassification.CustomModel.TFLite.load({
		model: 'model/model.tflite'
	});
}

export async function classifyImage(image: HTMLImageElement) {
	if (!model) {
		await loadClassifier();
	}

	if (!model) {
		throw new Error('Model not loaded');
	}
	const result = await model.predict(image);
	console.log(result.classes);

	return result;
}
