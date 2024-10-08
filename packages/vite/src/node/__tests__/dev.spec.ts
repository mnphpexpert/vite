import { resolveConfig } from '..'
import { describe, test, expect } from 'vitest'

describe('resolveBuildOptions in dev', () => {
  test('build.rollupOptions should not have input in lib', async () => {
    const config = await resolveConfig(
      {
        build: {
          lib: {
            entry: './index.js'
          }
        }
      },
      'serve'
    )

    expect(config.build.rollupOptions).not.toHaveProperty('input')
  })
})
