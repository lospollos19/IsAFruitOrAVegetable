const URL = "./my_model/";

let model, webcam, progressContainer, maxPredictions, progressLabels;

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    const flip = true;
    webcam = new tmImage.Webcam(window.innerWidth / 4, window.innerWidth / 4, flip);
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    progressContainer = document.getElementById("progress-container");
    const classNames = model.getClassLabels();
    progressLabels = [];
    for (let i = 0; i < maxPredictions; i++) {
        const label = document.createElement("label");
        label.textContent = classNames[i];
        progressContainer.appendChild(label);
        progressLabels.push(label);
        const progressBar = document.createElement("progress");
        progressBar.max = 1;
        progressBar.value = 0;
        progressBar.style.width = `${webcam.canvas.width}px`;
        progressContainer.appendChild(progressBar);
    }
    document.querySelector('button').style.display = 'none';
}

async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);
    const sortedPrediction = prediction.sort((a, b) => b.probability - a.probability);
    for (let i = 0; i < maxPredictions; i++) {
        progressContainer.childNodes[i * 2 + 1].value = sortedPrediction[i].probability;
        const newLabelText = `${sortedPrediction[i].className}: ${(sortedPrediction[i].probability * 100).toFixed(2)}%`;
        progressLabels[i].textContent = newLabelText;
    }
}

