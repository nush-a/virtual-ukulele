const audioCtx = new (window.AudioContext || window.webkitAudioContext)()

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

// each row of keys, will map to one row of ukulele notes
const keyRows = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
  ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
]

let windowStart = 0
const windowSize = 12
const buttonGrid = [] // 2D array to store all buttons
const ukuleleDiv = document.getElementById("ukulele")

for (let stringData of ukuleleData) {
  //loops through each string
  const stringRow = document.createElement("div") //creates a visual html container for this string
  stringRow.style.marginBottom = "5px"
  const rowButtons = [] //logical container of button data for this row

  for (let note of stringData.notes) {
    //loops through each note in string
    const button = document.createElement("button") //creates a new button element in memory
    button.textContent = note //displays note name
    button.style.marginRight = "2px"
    // Add click listener to play the note
    button.addEventListener("click", function () {
      // Resume audio context if suspended
      playNote(stringData.string, note, stringData.technique)
    })
    rowButtons.push(button) //adds the button to rowButtons array
    stringRow.appendChild(button) //visually adds button to screen
  }

  buttonGrid.push(rowButtons) //ads this rows button array into the main buttonGrid
  ukuleleDiv.appendChild(stringRow) //adds the whole row to the page visibly
}

const overlay = document.createElement("div")
overlay.style.position = "absolute"
overlay.style.border = "2px solid black"
overlay.style.pointerEvents = "none" // so mouse events register
overlay.style.height = "30px" // adjust to cover buttons
overlay.style.top = ukuleleDiv.offsetTop + "px"
overlay.style.backgroundColor = "rgba(0,0,0,0.05)" // slight tint for visibility
document.body.appendChild(overlay)

function playNote(stringLabel, note, technique) {
  // resume AudioContext if suspended
  if (audioCtx.state === "suspended") {
    audioCtx.resume()
  }
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

function updateOverlay() {
  const firstButton = buttonGrid[0][windowStart]
  const lastButton = buttonGrid[0][windowStart + windowSize - 1]
  overlay.style.left = firstButton.offsetLeft + "px"
  overlay.style.width =
    lastButton.offsetLeft +
    lastButton.offsetWidth -
    firstButton.offsetLeft +
    "px"
  overlay.style.top = ukuleleDiv.offsetTop + "px"
  overlay.style.height = firstButton.offsetHeight * 4 + 10 + "px" // cover all 4 strings
}

function handleKeyPress(event) {
  const key = event.key.toLowerCase()

  for (let rowIndex = 0; rowIndex < keyRows.length; rowIndex++) {
    //Loops through each keyboard row (4 total).
    const keyIndex = keyRows[rowIndex].indexOf(key) //Looks for the pressed key inside the current row.

    if (keyIndex !== -1) {
      const stringData = ukuleleData[rowIndex] //Matches the keyboard row to a ukulele string

      const visibleNotes = stringData.notes.slice(
        windowStart,
        windowStart + windowSize,
      )

      const note = visibleNotes[keyIndex]

      if (note) {
        playNote(stringData.string, note, stringData.technique)
      }
    }
  }
}

document.addEventListener("keydown", handleKeyPress) //Adds a global listener for keyboard input.

let isDragging = false //tracks whether user is currently dragging mouse
let startX = 0 //stores x position where drag started

document.addEventListener("mousedown", (e) => {
  if (e.target === overlay || e.target.closest("#ukulele")) {
    // Start dragging only if you clicked on the overlay or on the buttons
    isDragging = true
    startX = e.clientX
  }
}) //listens for when mouse is pressed

document.addEventListener("mouseup", () => {
  isDragging = false
}) //listens for when mouse is released

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return //only proceeds if user is currently dragging

  const dx = e.clientX - startX // change in x position of the mouse

  if (Math.abs(dx) > 10) {
    // sensitivity threshold, prevents accidental movements
    if (dx > 0) {
      // drag right → show later notes → move window right
      windowStart = Math.min(
        ukuleleData[0].notes.length - windowSize,
        windowStart + 1,
      )
    } else {
      // drag left → show earlier notes → move window left
      windowStart = Math.max(0, windowStart - 1)
    }

    startX = e.clientX //resests startX to current mouse pos for nxt movement calc
    updateOverlay() //calls function to update which buttons are outlined after window moved
  }
})

updateOverlay()
