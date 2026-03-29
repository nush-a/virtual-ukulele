const audioCtx = new (window.AudioContext || window.webkitAudioContext)()

function playNote(stringLabel, note, technique) {
  const filePath = `samples/${stringLabel}_${note}_${technique}.mp3`

  // Fetch the audio file
  fetch(filePath)
    .then((response) => response.arrayBuffer()) // get raw data
    .then((arrayBuffer) => audioCtx.decodeAudioData(arrayBuffer)) // decode MP3 into audio buffer
    .then((audioBuffer) => {
      const source = audioCtx.createBufferSource() // create a playback source
      source.buffer = audioBuffer
      source.connect(audioCtx.destination) // connect to speakers
      source.start() // play immediately
    })
    .catch((err) => console.error("Error loading audio:", err))
}
const ukuleleData = [
  {
    string: "S1",
    notes: [
      "A4",
      "Bb4",
      "B4",
      "C5",
      "Db5",
      "D5",
      "Eb5",
      "E5",
      "F5",
      "Gb5",
      "G5",
      "Ab5",
      "A5",
      "Bb5",
      "B5",
      "C6",
      "Db6",
      "D6",
      "Eb6",
      "E6",
    ],
    technique: "normal",
  }, // example notes for string 1
  {
    string: "S2",
    notes: [
      "E4",
      "F4",
      "Gb4",
      "G4",
      "Ab4",
      "A4",
      "Bb4",
      "B4",
      "C5",
      "Db5",
      "D5",
      "Eb5",
      "E5",
      "F5",
      "Gb5",
      "G5",
      "Ab5",
      "A5",
      "Bb5",
      "B5",
    ],
    technique: "normal",
  },
  {
    string: "S3",
    notes: [
      "C4",
      "Db4",
      "D4",
      "Eb4",
      "E4",
      "F4",
      "Gb4",
      "G4",
      "Ab4",
      "A4",
      "Bb4",
      "B4",
      "C5",
      "Db5",
      "D5",
      "Eb5",
      "E5",
      "F5",
      "Gb5",
      "G5",
    ],
    technique: "normal",
  },
  {
    string: "S4",
    notes: [
      "G3",
      "Ab3",
      "A3",
      "Bb3",
      "B3",
      "C4",
      "Db4",
      "D4",
      "Eb4",
      "E4",
      "F4",
      "Gb4",
      "G4",
      "Ab4",
      "A4",
      "Bb4",
      "B4",
      "C5",
      "Db5",
      "D5",
    ],
    technique: "normal",
  },
]

const ukuleleDiv = document.getElementById("ukulele")

for (let stringData of ukuleleData) {
  const stringRow = document.createElement("div") // create a row for this string

  for (let note of stringData.notes) {
    const button = document.createElement("button") // create a button for each note
    button.textContent = note // display note name
    button.addEventListener("click", () =>
      playNote(stringData.string, note, stringData.technique),
    )
    stringRow.appendChild(button) // add the button to the row
  }

  ukuleleDiv.appendChild(stringRow) // add the row to the main container
}
