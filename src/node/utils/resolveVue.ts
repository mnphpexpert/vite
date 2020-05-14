import path from 'path'
import { resolveFrom } from './pathUtils'
import sfcCompiler from '@vue/compiler-sfc'
import chalk from 'chalk'

interface ResolvedVuePaths {
  vue: string | undefined
  compiler: string
  version: string
  isLocal: boolean
}

let resolved: ResolvedVuePaths | undefined = undefined

// Resolve the correct `vue` and `@vue.compiler-sfc` to use.
// If the user project has local installations of these, they should be used;
// otherwise, fallback to the dependency of Vite itself.
export function resolveVue(root: string): ResolvedVuePaths {
  if (resolved) {
    return resolved
  }
  let vuePath: string | undefined
  let compilerPath: string
  let isLocal = false
  let vueVersion: string | undefined

  try {
    const userVuePkg = resolveFrom(root, 'vue/package.json')
    vueVersion = require(userVuePkg).version
    isLocal = true
  } catch (e) {}

  if (isLocal) {
    // user has local vue, verify that the same version of @vue/compiler-sfc
    // is also installed.
    // vuePath will be undefined in this case since vue itself will be
    // optimized by the deps optimizer and we can just let the resolver locate
    // it.
    try {
      const compilerPkgPath = resolveFrom(
        root,
        '@vue/compiler-sfc/package.json'
      )
      const compilerPkg = require(compilerPkgPath)
      if (compilerPkg.version !== vueVersion) {
        throw new Error()
      }
      compilerPath = path.join(path.dirname(compilerPkgPath), compilerPkg.main)
    } catch (e) {
      // user has local vue but has no compiler-sfc
      console.error(
        chalk.red(
          `[vite] Error: a local installation of \`vue\` is detected but ` +
            `no matching \`@vue/compiler-sfc\` is found. Make sure to install ` +
            `both and use the same version.`
        )
      )
      compilerPath = require.resolve('@vue/compiler-sfc')
    }
  } else {
    // user has no local vue, use vite's dependency version
    vueVersion = require('vue/package.json').version
    vuePath = require.resolve(
      '@vue/runtime-dom/dist/runtime-dom.esm-bundler.js'
    )
    compilerPath = require.resolve('@vue/compiler-sfc')
  }

  resolved = {
    version: vueVersion!,
    vue: vuePath,
    compiler: compilerPath,
    isLocal
  }
  return resolved
}

export function resolveCompiler(cwd: string): typeof sfcCompiler {
  return require(resolveVue(cwd).compiler)
}
