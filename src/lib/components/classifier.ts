import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

let fileuploadprops = {
	id: 'inputImage'
};

let predictionsResult: Prediction[] = [];

let files: FileList;

let model: mobilenet.MobileNet;
let predictionsLoading = false;

interface Prediction {
	className: string;
	probability: number;
}

const loadModel = async () => {
	const version = 2;
	const alpha = 0.5;
	model = await mobilenet.load({ version, alpha });
	console.log('Model loaded successfully');
	return model;
};

const preprocessImage = (imageElement: HTMLImageElement) => {
	const imageTensor = tf.browser.fromPixels(imageElement);
	const resizedImageTensor = tf.image.resizeBilinear(imageTensor, [224, 224]);
	// const normalizedImageTensor = resizedImageTensor.div(255.0);
	return resizedImageTensor;
};

const classifyImage = async (
	model: mobilenet.MobileNet,
	preprocessedImage: tf.Tensor3D
) => {
	const predictions = await model.classify(preprocessedImage);
	return predictions;
};

const predictionImage = async (imgDisplay: HTMLImageElement) => {
	predictionsLoading = true;
	const model = await loadModel();
	const preprocessedImage = preprocessImage(imgDisplay);
	predictionsResult = await classifyImage(model, preprocessedImage);
	predictionsLoading = false;
	return predictionsResult;
};

export async function classify(
	imageElement: HTMLImageElement
): Promise<Prediction[]> {
	return await predictionImage(imageElement);
}
