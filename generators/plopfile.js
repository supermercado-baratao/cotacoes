import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const indexPath = path.resolve(dirname, '../src/components/index.ts')

export default (plop) => {
  plop.setGenerator('component', {
    description: 'Create a component',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'What is your component name?'
      }
    ],
    actions: [
      {
        type: 'add',
        path: '../src/components/{{kebabCase name}}/index.tsx',
        templateFile: 'templates/component.tsx.hbs'
      },
      {
        type: 'add',
        path: '../src/components/{{kebabCase name}}/style.ts',
        templateFile: 'templates/style.ts.hbs'
      },
      () => {
        if (!fs.existsSync(indexPath)) {
          const dir = path.dirname(indexPath)
          fs.mkdirSync(dir, { recursive: true })
          fs.writeFileSync(indexPath, '')
        }
      },
      {
        type: 'append',
        path: '../src/components/index.ts',
        template: "export * from './{{kebabCase name}}'",
        separator: ''
      },
      () => {
        const indexPath = path.resolve(dirname, '../src/components/index.ts')
        const content = fs.readFileSync(indexPath, 'utf-8')
        const lines = content.split('\n')
        const updatedContent =
          lines
            .filter((line) => line.trim() !== '')
            .sort()
            .join('\n') + '\n'
        fs.writeFileSync(indexPath, updatedContent)
      }
    ]
  })
}
