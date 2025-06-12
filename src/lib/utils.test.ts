import { shortId } from './utils'

describe('shortId', () => {
  it('returns first 8 uppercase characters', () => {
    expect(shortId('abcde12345')).toBe('ABCDE123')
  })
})
