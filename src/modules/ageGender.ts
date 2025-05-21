import * as faceapi from 'face-api.js'

export interface AgeGenderResult {
  age: number
  gender: string
  genderProbability: number
}

const initParams = {
  modelUri: '/models',
  option: new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }),
}

export async function loadModels(): Promise<void> {
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(initParams.modelUri),
    faceapi.nets.ageGenderNet.loadFromUri(initParams.modelUri),
  ])
}

export async function detectAgeAndGender(video: HTMLVideoElement): Promise<AgeGenderResult> {
  const detections = await faceapi.detectAllFaces(video, initParams.option).withAgeAndGender()

  if (detections.length > 0) {
    return {
      age: detections[0].age,
      gender: detections[0].gender,
      genderProbability:
        detections[0].gender === 'male'
          ? detections[0].genderProbability
          : 1 - detections[0].genderProbability,
    }
  }

  return { age: 0, gender: '', genderProbability: 0 }
}
