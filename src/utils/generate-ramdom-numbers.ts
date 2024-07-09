import { randomInt } from 'crypto'

export function generateRandomNumbers() {
  const randomNumbers = []
  for (let i = 0; i < 4; i++) {
    randomNumbers.push(randomInt(0, 9))
  }
  return randomNumbers.join('').toString()
}
