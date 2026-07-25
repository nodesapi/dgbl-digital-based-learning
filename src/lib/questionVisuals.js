export function getQuestionVisualLabel(question) {
  if (!question?.clue) {
    return ''
  }

  const match = String(question.clue).match(/gambar:\s*(.+)$/i)
  return match ? match[1].trim() : ''
}
