const URL = "./my_model/";

let model, webcam, progressContainer, maxPredictions, progressLabels;

// Load the image model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(window.innerWidth / 4, window.innerWidth / 4, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    progressContainer = document.getElementById("progress-container");

    const classNames = ["Pomme", "Banane", "Poivron", "Tomate", "Fraise", "Concombre"]; // Ajoutez les noms correspondants à chaque classe ici
    progressLabels = []; // Tableau pour stocker les références des labels

    for (let i = 0; i < maxPredictions; i++) {
        const label = document.createElement("label");
        label.textContent = classNames[i];
        progressContainer.appendChild(label);
        progressLabels.push(label); // Stockez la référence du label dans le tableau

        const progressBar = document.createElement("progress");
        progressBar.max = 1;
        progressBar.value = 0;
        progressBar.style.width = `${webcam.canvas.width}px`;
        progressContainer.appendChild(progressBar);
    }

    document.querySelector('button').style.display = 'none';
}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    const sortedPrediction = prediction.sort((a, b) => b.probability - a.probability);
    for (let i = 0; i < maxPredictions; i++) {
        progressContainer.childNodes[i * 2 + 1].value = sortedPrediction[i].probability; // Mettez à jour l'index pour accéder à la bonne barre de progression

        // Mettez à jour le texte du label ici
        const newLabelText = `${sortedPrediction[i].className}: ${(sortedPrediction[i].probability * 100).toFixed(2)}%`;
        progressLabels[i].textContent = newLabelText;
    }
}

