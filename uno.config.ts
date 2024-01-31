// uno.config.ts
import { defineConfig, transformerDirectives } from 'unocss'
// import transformerDirectives from '@unocss/transformer-directives'

// https://unocss.dev/interactive/

export default defineConfig({
  // ...UnoCSS options

  // Rules define the way UnoCSS search and generate CSS for your codebase.
  // rules: [
  //   ['m-1', { margin: '0.25rem' }],
  //   [/^p-(\d+)$/, match => ({ padding: `${ match[1] / 4 }rem` })]
  // ],
  transformers: [
    transformerDirectives()
  ],
  shortcuts: {
    'btn': 'py-2 px-4 font-semibold rounded-lg shadow-md',
    'btn-green': 'text-white bg-green-500 hover:bg-green-700'
  }
})
