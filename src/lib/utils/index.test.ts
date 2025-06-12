import { shortId } from './index'

describe('shortId', () => {
  it('returns first 8 uppercase characters', () => {
    expect(shortId('abcde12345')).toBe('ABCDE123')
  })
})
