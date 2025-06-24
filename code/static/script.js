fetch("/data")
  .then(res => {
    console.log("Response status:", res.status);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    console.log("Data received:", data);
    
    const requiredFields = ['timestamps', 'X_prime', 'Y_prime', 'Z_prime', 'Cube', 'SourceFiles', 'Type'];
    for (const field of requiredFields) {
      if (!data[field]) {
        console.error(`Missing field: ${field}`);
        return;
      }
    }
    
    const timestamps = data.timestamps;
    const xData = data.X_prime;
    const yData = data.Y_prime;
    const zData = data.Z_prime;
    const cubeData = data.Cube;
    const sourceFiles = data.SourceFiles;
    const types = data.Type;

    console.log(`Loaded ${timestamps.length} data points`);
    
    const slider = document.getElementById("slider");
    const timestampLabel = document.getElementById("timestamp");
    const showPredictionsCheckbox = document.getElementById("showPredictions");

    slider.max = timestamps.length - 1;
    let currentIndex = 0;
    let playing = false;

    function updatePlot(index) {
      console.log(`Updating plot for index ${index}`);
      const traces = [];

      const drawCube = (cube, color, name) => {
        const edges = [
          [0, 1], [1, 2], [2, 3], [3, 0], 
          [4, 5], [5, 6], [6, 7], [7, 4], 
          [0, 4], [1, 5], [2, 6], [3, 7]  
        ];
        return edges.map(([i, j]) => ({
          type: 'scatter3d',
          mode: 'lines',
          x: [cube[i][0], cube[j][0]],
          y: [cube[i][1], cube[j][1]],
          z: [cube[i][2], cube[j][2]],
          line: { color, width: 2 },
          name,
          hoverinfo: "text",
          text: `${name}`,
          showlegend: false
        }));
      };

      traces.push({
        type: 'scatter3d',
        mode: 'lines',
        x: [0, xData[index][0]],
        y: [0, xData[index][1]],
        z: [0, xData[index][2]],
        line: { color: 'red', width: 6 },
        name: "X'",
        showlegend: true
      });
      traces.push({
        type: 'scatter3d',
        mode: 'lines',
        x: [0, yData[index][0]],
        y: [0, yData[index][1]],
        z: [0, yData[index][2]],
        line: { color: 'green', width: 6 },
        name: "Y'",
        showlegend: true
      });
      traces.push({
        type: 'scatter3d',
        mode: 'lines',
        x: [0, zData[index][0]],
        y: [0, zData[index][1]],
        z: [0, zData[index][2]],
        line: { color: 'blue', width: 6 },
        name: "Z'",
        showlegend: true
      });

      const currentType = types[index];
      const currentColor = currentType === "actual" ? "orange" : "purple";
      const currentLabel = `${currentType.toUpperCase()}: ${sourceFiles[index]}`;
      if (types[index] === "actual" || showPredictionsCheckbox.checked) {
        traces.push(...drawCube(cubeData[index], currentColor, currentLabel));
}

      for (let i = 0; i < timestamps.length; i++) {
        if (i !== index && timestamps[i] === timestamps[index]) {
          const color = types[i] === "actual" ? "orange" : "purple";
          const label = `${types[i].toUpperCase()}: ${sourceFiles[i]}`;
          traces.push(...drawCube(cubeData[i], color, label));
        }
      }

      // Predicted cubes
      if (showPredictionsCheckbox.checked) {
        for (let i = 0; i < timestamps.length; i++) {
          if (types[i] === "predicted" && timestamps[i] === timestamps[index]) {
            traces.push(...drawCube(cubeData[i], "purple", `Predicted: ${sourceFiles[i]}`));
          }
        }
      }

      const layout = {
  margin: { l: 0, r: 0, b: 0, t: 0 },
  scene: {
    bgcolor: "rgba(0,0,0,0)", 
    xaxis: { title: 'X', color: 'white' },
    yaxis: { title: 'Y', color: 'white' },
    zaxis: { title: 'Z', color: 'white' }
  },
  paper_bgcolor: 'rgba(15, 2, 2, 0)', 
  plot_bgcolor: 'rgba(7, 9, 2, 0.8)',
  legend: { font: { color: "white" } }
};


      console.log(`Creating plot with ${traces.length} traces`);
      Plotly.newPlot("plot", traces, layout).then(() => {
        console.log("Plot created successfully");
      }).catch(err => {
        console.error("Error creating plot:", err);
      });
      
      timestampLabel.textContent = timestamps[index];
    }

    function drawFileBar(fileSources) {
      const canvas = document.getElementById("fileBar");
      const ctx = canvas.getContext("2d");
      const w = canvas.width = document.getElementById("slider").offsetWidth;
      const h = canvas.height;

      const files = [...new Set(fileSources)];
      const colors = {};

      files.forEach((file, i) => {
        const hue = (i * 60) % 360;
        colors[file] = `hsl(${hue}, 70%, 60%)`;
      });

      const total = fileSources.length;
      const segWidth = w / total;

      for (let i = 0; i < total; i++) {
        ctx.fillStyle = colors[fileSources[i]];
        ctx.fillRect(i * segWidth, 0, segWidth, h);
      }

      canvas.onmousemove = (e) => {
        const rect = canvas.getBoundingClientRect();
        const index = Math.floor((e.clientX - rect.left) / segWidth);
        canvas.title = `${fileSources[index]} (${types[index]})`;
      };
    }

    drawFileBar(sourceFiles);
    updatePlot(currentIndex);

    slider.oninput = (e) => {
      currentIndex = parseInt(e.target.value);
      updatePlot(currentIndex);
    };

    showPredictionsCheckbox.onchange = () => {
      updatePlot(currentIndex);
    };

    let playbackSpeed = 1;
    setInterval(() => {
      if (playing) {
        currentIndex = (currentIndex + playbackSpeed) % timestamps.length;
        slider.value = currentIndex;
        updatePlot(currentIndex);
      }
    }, 100);

    document.getElementById("speedSelect").onchange = (e) => {
      playbackSpeed = parseInt(e.target.value);
    };

    document.addEventListener("keydown", e => {
      if (e.code === "Space") {
        e.preventDefault();
        playing = !playing;
        console.log("Animation", playing ? "started" : "stopped");
      }
    });
  })
  .catch(err => {
    console.error("Failed to fetch data:", err);
    document.getElementById("timestamp").textContent = "Error loading data - check console";
  });

function downloadPlotImage() {
  const plotElement = document.getElementById('plot');

  Plotly.Plots.resize(plotElement);

  setTimeout(() => {
    Plotly.toImage(plotElement, {
      format: 'png',
      width: plotElement.offsetWidth || 1000,
      height: plotElement.offsetHeight || 700,
      scale: 2
    }).then(dataUrl => {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'attitude_plot.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }).catch(err => {
      console.error("Error during image export:", err);
      alert("Failed to save image. Check console for details.");
    });
  }, 500); 
}

