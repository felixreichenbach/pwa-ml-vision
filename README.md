# Progressive Web App With Camera Image classifier

## About this project

This project presents an image classifier using MobileNet from TensorFlow.js within a SvelteKit framework. Users can start the camera and then by the press of a button classify the current camera image. The results are displayed underneath.

## Getting Started

1. **Clone the repository:**

    ```bash
    git clone https://github.com/felixreichenbach/pwa-ml-vision.git
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Start the development server:**

    ```bash
    npm run dev -- --open
    ```

4. Access the app: Open <http://localhost:5173/> in your browser.

## ML Models

[efficientnet](https://www.kaggle.com/models/tensorflow/efficientnet/tfLite) -> `classifier.model`

## Patching

There is a bug in the Tensorflow JS library. A Viam created patch is available in the `patches` directory which is automaticaly applied whenever `pnpm install` is run.

## Build Module

```bash
tar -czvf module.tar.gz build meta.json

viam module upload --upload=module.tar.gz --platform=any --version=0.0.2
```
