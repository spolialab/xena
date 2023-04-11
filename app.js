const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");

const instructions = document.getElementById("instructions");
const hideInstructionsCheckbox = document.getElementById("hideInstructionsCheckbox");

if (localStorage.getItem("hideInstructions") === "true") {
  instructions.style.display = "none";
}

hideInstructionsCheckbox.addEventListener("change", () => {
  localStorage.setItem("hideInstructions", hideInstructionsCheckbox.checked);
});

canvas.addEventListener("mousedown", () => {
  instructions.style.display = "none";
});


// Set canvas size and devicePixelRatio
const devicePixelRatio = window.devicePixelRatio || 1;
canvas.width = window.innerWidth * devicePixelRatio;
canvas.height = window.innerHeight * devicePixelRatio;
canvas.style.width = `${window.innerWidth}px`;
canvas.style.height = `${window.innerHeight}px`;
ctx.scale(devicePixelRatio, devicePixelRatio);


const playButton = document.getElementById("playButton");
const toggleReferenceLinesCheckbox = document.getElementById("toggleReferenceLines");
let showReferenceLines = false;

toggleReferenceLinesCheckbox.addEventListener("change", () => {
  showReferenceLines = toggleReferenceLinesCheckbox.checked;
  drawLinesAndPlayhead(); // Redraw the canvas with the updated reference lines visibility
});



const synth = new Tone.Synth({
	"volume": 0,
	"detune": 0,
	"portamento": 0.05,
	"envelope": {
		"attack": 0.05,
		"attackCurve": "exponential",
		"decay": 0,
		"decayCurve": "exponential",
		"release": 1.5,
		"releaseCurve": "exponential",
		"sustain": 1
	},
	"oscillator": {
		"partialCount": 0,
		"partials": [],
		"phase": 0,
		"type": "amtriangle",
		"harmonicity": 0.5,
		"modulationType": "sine"
	}
}).toDestination();
synth.type = "sine2"
const lines = [];

let drawing = false;
let playheadPosition = 0;
let playing = false;

const activeSynths = [];
        playheadAnimation();



// Add effects
const reverb = new Tone.Reverb(1).toDestination();
synth.connect(reverb);


canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  ctx.beginPath();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.lineWidth = 2.5; // Adjust the line width as desired
   ctx.strokeStyle = "black";
  ctx.moveTo(e.clientX, e.clientY);
  lines.push([{ x: e.clientX, y: e.clientY }]);
});


canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;
    ctx.lineTo(e.clientX, e.clientY);
    ctx.stroke();
    lines[lines.length - 1].push({ x: e.clientX, y: e.clientY });
});

canvas.addEventListener("mouseup", () => {
    drawing = false;
});

canvas.addEventListener("mouseleave", () => {
    drawing = false;
});

playButton.addEventListener("click", async () => {
    if (Tone.context.state !== "running") {
        await Tone.start();
    }

    playing = !playing;
    playButton.textContent = playing ? "Stop" : "Play";

    if (playing) {
        playheadAnimation();
    } else {
        synth.stop();
    }
});

function playheadAnimation() {
    if (!playing) {
        playheadPosition = 0;
        drawLinesAndPlayhead();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    playheadPosition += 1;

    if (playheadPosition > canvas.width) {
        playing = false;
        playButton.textContent = "Play";
        playheadPosition = 0;
    }

    drawLinesAndPlayhead();

    

      for (const synth of activeSynths) {
    synth.playing = false;
  }

  for (const line of lines) {
    for (const point of line) {
      if (Math.abs(point.x - playheadPosition) < 1) {
        const frequency = (1 - (point.y / (canvas.height / devicePixelRatio))) * 1000;

        const amplitude = 1 - point.y / (canvas.height / devicePixelRatio);

        let synth = activeSynths.find((s) => !s.playing);

        if (!synth) {
          synth = new Tone.Synth({
	"volume": 0,
	"detune": 0,
	"portamento": 0.05,
	"envelope": {
		"attack": 0.05,
		"attackCurve": "exponential",
		"decay": 0,
		"decayCurve": "exponential",
		"release": 1.5,
		"releaseCurve": "exponential",
		"sustain": 1
	},
	"oscillator": {
		"partialCount": 0,
		"partials": [],
		"phase": 0,
		"type": "amtriangle",
		"harmonicity": 0.5,
		"modulationType": "sine"
	}
}).toDestination();
          activeSynths.push(synth);
        }

        synth.frequency.value = frequency;
        synth.volume.value = Tone.gainToDb(amplitude);

        if (!synth.active) {
          synth.triggerAttack(synth.frequency.value);
          synth.lastPlayedX = point.x;

          synth.active = true;
        }

        synth.playing = true;
      }
    }
  }

 for (const synth of activeSynths) {
  if (!synth.playing) {
    if (synth.active && Math.abs(synth.lastPlayedX - playheadPosition) > 2) {
      synth.triggerRelease();
      synth.active = false;
    }
  }
}


    requestAnimationFrame(playheadAnimation);
}

function drawLinesAndPlayhead() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
 if (showReferenceLines) {
  // Draw Y-axis markers for musical notes
  const noteNames = ["C", "D", "E", "F", "G", "A", "B"];
  const minFreq = 100;
  const maxFreq = 1000;
  const numOctaves = 4;

  for (let i = 0; i < numOctaves * noteNames.length; i++) {
    const noteName = noteNames[i % noteNames.length];
    const octave = Math.floor(i / noteNames.length);
    const freq = minFreq * Math.pow(2, (i + 3 * octave) / 12);
      const yPos =
      (canvas.height / devicePixelRatio) -
      ((freq - minFreq) / (maxFreq - minFreq)) * (canvas.height / devicePixelRatio);


    ctx.fillStyle = "black";
    ctx.fillText(`${noteName}${octave + 1}`, 5, yPos);

    ctx.strokeStyle = "#DEE0ED";
    ctx.beginPath();
      ctx.lineWidth = 1; // Adjust the line width as desired
    ctx.moveTo(20, yPos);
     ctx.lineTo(canvas.width / devicePixelRatio, yPos);
    ctx.stroke();
  }

  // Draw X-axis markers for timing signatures
  const beatsPerMeasure = 4;
  const beatWidth = 40;

  for (let i = 0; i < canvas.width / beatWidth; i++) {
    const xPos = i * beatWidth;
    ctx.strokeStyle = i % beatsPerMeasure === 0 ? "#AFB4CA" : "#DEE0ED";
    ctx.beginPath();
    ctx.moveTo(xPos, 0);
    ctx.lineTo(xPos, canvas.height / devicePixelRatio);
    ctx.stroke();
    ctx.lineWidth = 1; // Adjust the line width as desired
  }
}

   // Draw the existing lines
  for (const line of lines) {
    for (let i = 0; i < line.length - 1; i++) {
      const point1 = line[i];
      const point2 = line[i + 1];

      if (Math.abs(point1.x - playheadPosition) < 10 || Math.abs(point2.x - playheadPosition) < 10) {
          const hueValue = Math.floor(((1 - (point1.y / (canvas.height/ devicePixelRatio)))) * 240);
        ctx.strokeStyle = `hsl(${hueValue}, 100%, 50%)`;
        ctx.lineWidth = 3;      } else {
        ctx.strokeStyle = "black";
      }

      ctx.beginPath();
      ctx.moveTo(point1.x, point1.y);
      ctx.lineTo(point2.x, point2.y);
      ctx.stroke();
    }
  }


  // Draw the playhead
  ctx.strokeStyle = "red";
  ctx.beginPath();
  ctx.moveTo(playheadPosition, 0);
  ctx.lineTo(playheadPosition, canvas.height/ devicePixelRatio);
  ctx.stroke();
}
