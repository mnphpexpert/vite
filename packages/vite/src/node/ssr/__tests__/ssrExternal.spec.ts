import { stripNesting } from '../ssrExternal'
import { test, expect } from 'vitest'

test('stripNesting', async () => {
  expect(stripNesting(['c', 'p1>c1', 'p2 > c2'])).toEqual(['c', 'c1', 'c2'])
})
