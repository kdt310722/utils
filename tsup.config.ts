import { existsSync } from 'node:fs'
import { cp, mkdir } from 'node:fs/promises'
import path from 'node:path'
import fastGlob from 'fast-glob'
import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.ts', 'src/*/index.ts'],
    format: ['esm', 'cjs'],
    clean: true,
    shims: true,
    sourcemap: true,
    dts: false,
    async onSuccess() {
        // eslint-disable-next-line import/no-named-as-default-member
        const files = fastGlob.sync('src/**/*', { onlyFiles: true })

        for (const file of files) {
            const { dir, base } = path.parse(file)
            const outDir = path.join('dist', dir)

            if (dir.length > 0 && !existsSync(dir)) {
                await mkdir(outDir, { recursive: true })
            }

            await cp(file, path.join(outDir, base))
        }

        await cp('README.md', 'dist/README.md')
        await cp('LICENSE.md', 'dist/LICENSE.md')
        await cp('package.json', 'dist/package.json')
    },
})
