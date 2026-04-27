const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
const sampleCache = {}
let samplesReady = false

const loadingScreen = document.getElementById("loadingScreen")
const progressText = document.getElementById("progressText")
const app = document.getElementById("ukuleleApp")
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
const sampleList = []

for (let s of ukuleleData) {
  for (let note of s.notes) {
    sampleList.push({
      string: s.string,
      note,
      technique: s.technique,
      key: `${s.string}_${note}_${s.technique}`,
    })
  }
}

async function loadAllSamples() {
  const total = sampleList.length
  let loaded = 0

  for (const sample of sampleList) {
    const res = await fetch(`samples/${sample.key}.mp3`)
    const arrayBuffer = await res.arrayBuffer()
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)

    sampleCache[sample.key] = audioBuffer

    loaded++
    const percent = Math.floor((loaded / total) * 100)

    progressText.textContent = `${percent}%`
  }
}
function showApp() {
  loadingScreen.style.display = "none"
  app.style.display = "block"

  requestAnimationFrame(() => {
    updateOverlay()
  })
}
async function init() {
  loadingScreen.style.display = "flex"
  app.style.display = "none"

  await loadAllSamples()

  samplesReady = true

  showApp()
}

init()

// each row of keys, will map to one row of ukulele notes
//note: need to fix the fact that i don't have twelve characters per row. either add in enter and shift keys, or reduce window to ten.
const keyRows = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m", ",", "."],
]

let windowStart = 0
const windowSize = 9
const activeKeys = {} //stores wheter a key is currently pressed or not
const buttonGrid = [] // 2D array to store all buttons
const activeSources = {} // {stringlabel: {sources, gain}}
const ukuleleDiv = document.getElementById("ukulele")
//button toggle for frets labels
const toggleBtn = document.getElementById("toggleLabels")
const lastKeyPerRow = {}
const keyTime = {}

for (let rowIndex = 0; rowIndex < ukuleleData.length; rowIndex++) {
  const stringData = ukuleleData[rowIndex] //loops through each uke string

  const stringRow = document.createElement("div") //creates a visual html container for this string
  stringRow.classList.add("string") //gives styling with the css class string

  const rowButtons = [] //logical container of button data for this row

  for (let i = 1; i < stringData.notes.length; i++) {
    const note = stringData.notes[i] //loops through each note in string

    const fret = document.createElement("div") //creates a new fret element in memory
    fret.classList.add("fret") //adds styling via css class fret

    //labelling frets with their note names
    const label = document.createElement("span") //adds a text container to put note names in
    label.textContent = note //makes sure note is the text inside label
    label.classList.add("note-label") //creates a css class for the label styling
    fret.appendChild(label) //label is added inside the fret div
    //frets get smaller as they get higher up to look like  real instrument.
    const scaleLength = 1100 // arbitrary total length in px
    const fretPosition = scaleLength - scaleLength / Math.pow(2, i / 12)
    const prevPosition = scaleLength - scaleLength / Math.pow(2, (i - 1) / 12)
    const width = fretPosition - prevPosition
    fret.style.width = width + "px"

    // add dot on specific frets (only on one row)
    if (i === 5 || i === 7 || i === 10 || i === 12) {
      //adds dots on spcific frets like a real ukulele's markings
      if (rowIndex === 1) {
        fret.classList.add("dot-fret")
      }
    }
    //add click listener to play a note
    fret.addEventListener("click", () => {
      playNote(stringData.string, note, stringData.technique)
      vibrateString(rowIndex)
    })

    rowButtons.push(fret) //adds the fret to rowButtons array
    stringRow.appendChild(fret) //visually adds fret to screen
  }

  buttonGrid.push(rowButtons) //ads this rows fret/button array into the main buttonGrid
  ukuleleDiv.appendChild(stringRow) //adds the whole row to the page visibly
}

// requestAnimationFrame(() => {
//   drawContinuousStrings()
// })
//window overlay
const overlay = document.createElement("div")
overlay.style.position = "absolute"
overlay.style.border = "2px solid black"
overlay.style.pointerEvents = "none" // so mouse events register
overlay.style.height = "30px" // adjust to cover buttons
overlay.style.top = ukuleleDiv.offsetTop + "20px"
overlay.style.backgroundColor = "rgba(219, 241, 243, 0.42)" // slight tint for visibility
document.body.appendChild(overlay)

function getNoteIndex(rowIndex, idx) {
  // root column always maps to fret 0
  if (idx === 0) return 0

  // everything else is windowed and shifted
  return windowStart + idx
}

// function playNote(stringLabel, note, technique) {
//   // resume AudioContext if suspended
//   if (audioCtx.state === "suspended") {
//     audioCtx.resume()
//   }
//   //reads file paths of samples
//   const filePath = `samples/${stringLabel}_${note}_${technique}.mp3`
//   //fetch the audio file
//   fetch(filePath)
//     .then((r) => r.arrayBuffer()) // get raw data
//     .then((buffer) => audioCtx.decodeAudioData(buffer)) // decode MP3 into audio buffer
//     .then((audioBuffer) => {
//       const now = audioCtx.currentTime

//       // fade out previous note on this string
//       if (activeSources[stringLabel]) {
//         const { source, gain } = activeSources[stringLabel]

//         try {
//           gain.gain.cancelScheduledValues(now)
//           gain.gain.setValueAtTime(gain.gain.value, now)
//           gain.gain.linearRampToValueAtTime(0, now + 0.4)

//           //source.stop(now + 0.02)
//           source.stop(now + 0.4)
//         } catch (e) {}
//       }

//       // create new source + gain
//       const source = audioCtx.createBufferSource()
//       const gainNode = audioCtx.createGain()

//       source.buffer = audioBuffer

//       // start at full volume
//       gainNode.gain.setValueAtTime(1, now)

//       source.connect(gainNode)
//       gainNode.connect(audioCtx.destination)

//       source.start()
//       // store this as the current active source for the string
//       activeSources[stringLabel] = {
//         source,
//         gain: gainNode,
//       }
//     })
//     .catch((err) => console.error("Error loading audio:", err))
// }

function playNote(stringLabel, note, technique) {
  if (!samplesReady) return

  if (audioCtx.state === "suspended") {
    audioCtx.resume()
  }

  const key = `${stringLabel}_${note}_${technique}`
  const audioBuffer = sampleCache[key]

  if (!audioBuffer) return

  const now = audioCtx.currentTime

  if (activeSources[stringLabel]) {
    const { source, gain } = activeSources[stringLabel]

    try {
      gain.gain.cancelScheduledValues(now)
      gain.gain.setValueAtTime(gain.gain.value, now)
      gain.gain.linearRampToValueAtTime(0, now + 0.02)
      source.stop(now + 0.02)
    } catch (e) {}
  }

  const source = audioCtx.createBufferSource()
  const gainNode = audioCtx.createGain()

  source.buffer = audioBuffer
  gainNode.gain.setValueAtTime(1, now)

  source.connect(gainNode)
  gainNode.connect(audioCtx.destination)

  source.start()

  activeSources[stringLabel] = { source, gain: gainNode }
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

// function drawContinuousStrings() {
//   const overlay = document.getElementById("stringOverlay")
//   overlay.innerHTML = ""

//   const strings = document.querySelectorAll(".string")
//   const ukeRect = document.querySelector(".ukulele").getBoundingClientRect()

//   strings.forEach((str, i) => {
//     const rect = str.getBoundingClientRect()

//     const line = document.createElement("div")
//     line.classList.add("string-line")

//     line.style.top = rect.top - ukeRect.top + rect.height / 2 + "px"
//     line.style.width = ukeRect.width + "px"

//     overlay.appendChild(line)
//   })
// }
//highlights fret when note is pressed on keyboard
function highlightFret(rowIndex, noteIndex) {
  const fret = buttonGrid[rowIndex][noteIndex - 1]

  if (!fret) return

  fret.classList.add("active-fret")
}

function handleKeyPress(event) {
  const key = event.key.toLowerCase()

  if (activeKeys[key]) return
  activeKeys[key] = true

  keyTime[key] = performance.now()

  for (let rowIndex = 0; rowIndex < keyRows.length; rowIndex++) {
    const row = keyRows[rowIndex]
    const idx = row.indexOf(key)

    if (idx === -1) continue

    // update last pressed key for this row
    lastKeyPerRow[rowIndex] = idx

    const stringData = ukuleleData[rowIndex]

    const noteIndex = getNoteIndex(rowIndex, idx)
    const note = stringData.notes[noteIndex]

    if (note) {
      playNote(stringData.string, note, stringData.technique)
      highlightFret(rowIndex, noteIndex)
      vibrateString(rowIndex)
    }
  }
}
function vibrateString(rowIndex) {
  const stringRow = ukuleleDiv.children[rowIndex]

  if (!stringRow) return

  stringRow.classList.add("vibrating")

  // remove class so animation can trigger again next time
  setTimeout(() => {
    stringRow.classList.remove("vibrating")
  }, 200)
}

toggleBtn.addEventListener("click", () => {
  ukuleleDiv.classList.toggle("hide-labels")
})

document.addEventListener("keydown", handleKeyPress) //Adds a global listener for keyboard input.

//global listener for keyup
document.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase() //normalizes to lower case
  delete activeKeys[key] //removes this key from the current set of pressed keys

  for (let rowIndex = 0; rowIndex < keyRows.length; rowIndex++) {
    //iterates through each keyboard row
    const row = keyRows[rowIndex] //gets the array of keys fo thsi specific row

    // find remaining active keys in this row
    //all currently held keys 0-> convert those held keys into its windex ithin this row -> returns index of key -> removes keys not in this row
    const activeIndices = Object.keys(activeKeys)
      .map((k) => row.indexOf(k))
      .filter((i) => i !== -1)
    const stringLabel = ukuleleData[rowIndex].string //findswhich ukulele string this row corresponds to
    const active = activeSources[stringLabel] //gets currently playing audio for this string

    // clear all highlights for this row
    for (let i = 0; i < buttonGrid[rowIndex].length; i++) {
      buttonGrid[rowIndex][i]?.classList.remove("active-fret")
    }

    // if no keys left → fade out current note
    if (activeIndices.length === 0) {
      //checks that keys arent still held down in this row
      if (active) {
        //checks if a note is currently playing after the keyup
        const now = audioCtx.currentTime //gets current audio time

        active.gain.gain.cancelScheduledValues(now) //clears prev vol auomation
        active.gain.gain.setValueAtTime(active.gain.gain.value, now) //locks gain at current volume
        active.gain.gain.linearRampToValueAtTime(0, now + 0.4) //ramps volume

        active.source.stop(now + 0.4) //stops playback at end of fade

        delete activeSources[stringLabel] //delete this note from active tracking
      }
      continue
    }

    // otherwise, keep highest (rightmost) key active
    const maxIndex = Math.max(...activeIndices)

    //highlightFret(rowIndex, maxIndex)
  }
})
let isDragging = false //tracks whether user is currently dragging mouse
let startX = 0 //stores x position where drag started
//test for git push
document.addEventListener("mousedown", (e) => {
  if (e.target === overlay || e.target.closest("#ukulele")) {
    // Start dragging only if you clicked on the overlay or on the buttons
    isDragging = true
    startX = e.clientX
  }
}) //listens for when mouse is pressed
document.querySelectorAll(".body-string").forEach((el) => {
  el.addEventListener("click", () => {
    const rowIndex = Number(el.dataset.row)
    const stringData = ukuleleData[rowIndex]

    const openNote = stringData.notes[0]

    playNote(stringData.string, openNote, stringData.technique)
    vibrateString(rowIndex)
  })
})
document.addEventListener("mouseup", () => {
  isDragging = false
}) //listens for when mouse is released

//window.addEventListener("resize", drawContinuousStrings)

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
