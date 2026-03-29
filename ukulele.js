function playNote(stringNumber, note, technique) {
  const audio = new Audio(`samples/${stringNumber}_${note}_${technique}.mp3`)
  audio.play()
}

const ukuleleData = [
  { string: "S1", notes: ["A4", "Bb4", "B4", "C5"], technique: "normal" }, // example notes for string 1
  { string: "S2", notes: ["E4", "F4", "Gb4", "G4"], technique: "normal" },
  { string: "S3", notes: ["C4", "Db4", "D4", "Eb4"], technique: "normal" },
  { string: "S4", notes: ["G3", "Ab3", "A3", "Bb3"], technique: "normal" },
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
