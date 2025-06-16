import { ref, type Ref } from 'vue'

const emotionHistory: Ref<{ [key: string]: number[] }> = ref({
  happiness: [],
  sadness: [],
  surprise: [],
  anger: [],
  fear: [],
  neutral: [],
})
const historyLength = 5

export function detectEmotion(blendShapes: any[]) {
  const emotions = {
    happiness: 0,
    sadness: 0,
    surprise: 0,
    anger: 0,
    fear: 0,
    neutral: 0,
  }

  const getScore = (name: string) =>
    blendShapes.find((shape) => shape.categoryName === name)?.score || 0

  emotions.happiness =
    0.5 * getScore('mouthSmileLeft') +
    0.5 * getScore('mouthSmileRight') +
    0.2 * getScore('eyeSquintLeft') +
    0.2 * getScore('eyeSquintRight')

  emotions.sadness =
    0.9 * getScore('mouthFrownLeft') +
    0.9 * getScore('mouthFrownRight') +
    0.4 * getScore('browDownLeft') +
    0.4 * getScore('browDownRight') +
    0.9 * getScore('mouthPucker')

  emotions.surprise =
    0.9 * getScore('eyeWideLeft') +
    0.9 * getScore('eyeWideRight') +
    0.9 * getScore('browUpLeft') +
    0.9 * getScore('browUpRight') +
    0.9 * getScore('jawOpen')

  emotions.anger =
    0.4 * getScore('browDownLeft') +
    0.4 * getScore('browDownRight') +
    0.3 * getScore('mouthPucker') +
    0.2 * getScore('eyeSquintLeft') +
    0.2 * getScore('eyeSquintRight')

  emotions.fear =
    0.3 * getScore('eyeWideLeft') +
    0.3 * getScore('eyeWideRight') +
    0.2 * getScore('browUpLeft') +
    0.2 * getScore('browUpRight') +
    0.2 * getScore('jawForward') +
    0.2 * getScore('jawOpen')

  const maxExpressionScore = Math.max(
    emotions.happiness,
    emotions.sadness,
    emotions.surprise,
    emotions.anger,
    emotions.fear,
  )
  emotions.neutral = maxExpressionScore < 0.3 ? 1 : 0

  Object.keys(emotions).forEach((key) => {
    emotionHistory.value[key].push(emotions[key])
    if (emotionHistory.value[key].length > historyLength) {
      emotionHistory.value[key].shift()
    }
  })

  const smoothedEmotions = Object.keys(emotions).reduce(
    (acc, key) => {
      const scores = emotionHistory.value[key]
      acc[key] = scores.length > 0 ? scores.reduce((sum, val) => sum + val, 0) / scores.length : 0
      return acc
    },
    {} as { [key: string]: number },
  )

  let maxEmotion = 'neutral'
  let maxScore = smoothedEmotions.neutral
  Object.keys(smoothedEmotions).forEach((key) => {
    if (smoothedEmotions[key] > maxScore) {
      maxEmotion = key
      maxScore = smoothedEmotions[key]
    }
  })

  return maxEmotion.charAt(0).toUpperCase() + maxEmotion.slice(1)
}
