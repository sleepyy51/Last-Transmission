const MAX_LENGTH = 240

// Split paragraphs into speech-bubble-sized beats at sentence ends. Paragraph
// boundaries are never crossed, so dramatic one-liners stay on their own.
export function beats(paragraphs) {
  return paragraphs.flatMap((paragraph) => {
    const sentences = paragraph
      .trim()
      .split(/(?<=[.!?…])\s+/)
      .map((sentence) => sentence.trim())

    const lines = []
    let line = ''
    for (const sentence of sentences) {
      if (line && line.length + 1 + sentence.length > MAX_LENGTH) {
        lines.push(line)
        line = sentence
      } else {
        line = line ? `${line} ${sentence}` : sentence
      }
    }
    if (line) lines.push(line)
    return lines
  })
}
