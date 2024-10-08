import { resolve } from 'path'
import { promises as fs } from 'fs'
import { describe, expect, it } from 'vitest'
import { transformGlobImport } from '../../../plugins/importMetaGlob'
import { transformWithEsbuild } from '../../../plugins/esbuild'

describe('fixture', async () => {
  const resolveId = (id: string) => id
  const root = resolve(__dirname, '..')

  it('transform', async () => {
    const id = resolve(__dirname, './fixture-a/index.ts')
    const code = (
      await transformWithEsbuild(await fs.readFile(id, 'utf-8'), id)
    ).code

    expect(
      (await transformGlobImport(code, id, root, resolveId))?.s.toString()
    ).toMatchSnapshot()
  })

  it('virtual modules', async () => {
    const root = resolve(__dirname, './fixture-a')
    const code = [
      "import.meta.glob('/modules/*.ts')",
      "import.meta.glob(['/../fixture-b/*.ts'])"
    ].join('\n')
    expect(
      (
        await transformGlobImport(code, 'virtual:module', root, resolveId)
      )?.s.toString()
    ).toMatchSnapshot()

    try {
      await transformGlobImport(
        "import.meta.glob('./modules/*.ts')",
        'virtual:module',
        root,
        resolveId
      )
      expect('no error').toBe('should throw an error')
    } catch (err) {
      expect(err).toMatchInlineSnapshot(
        "[Error: In virtual modules, all globs must start with '/']"
      )
    }
  })

  it('transform with restoreQueryExtension', async () => {
    const id = resolve(__dirname, './fixture-a/index.ts')
    const code = (
      await transformWithEsbuild(await fs.readFile(id, 'utf-8'), id)
    ).code

    expect(
      (await transformGlobImport(code, id, root, resolveId, true))?.s.toString()
    ).toMatchSnapshot()
  })
})
