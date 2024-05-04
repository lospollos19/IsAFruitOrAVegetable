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
        label.classList.add("percent-text")
        label.setAttribute('id', classNames[i]);
        progressContainer.appendChild(label);
        progressLabels.push(label);
        const progressBar = document.createElement("div");
        progressBar.classList.add("bardata")
        progressBar.max = 1;
        progressBar.value = 0;
        progressBar.style.width = `${webcam.canvas.width}px`;
        progressBar.setAttribute('id', classNames[i]);
        progressContainer.appendChild(progressBar);
    }
    document.querySelector('button').style.display = 'none';
    document.querySelector("div#legend").style.display = 'flex'
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
        const webcam_height = document.getElementById("webcam-container").getBoundingClientRect().height
        progressContainer.childNodes[i * 2 + 1].style.width = `${(sortedPrediction[i].probability).toFixed(4) * webcam_height}px`;
        const newLabelText = `${(sortedPrediction[i].probability * 100).toFixed(0)}%`;
        progressLabels[i].textContent = newLabelText;
    }
    if(prediction[0].probability > 0.5) {
        webcam.canvas.style.borderColor = '#714197'
    } else {
        webcam.canvas.style.borderColor = '#fece01'
    }
}

