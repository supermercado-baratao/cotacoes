export default (plop) => {
  plop.setGenerator('component', {
    description: 'Create a shared component',
    prompts: [
      {
        type: 'list',
        name: 'kind',
        message: 'Where does the component go?',
        choices: [
          { name: 'blocks (domain component)', value: 'blocks' },
          { name: 'ui (generic primitive)', value: 'ui' }
        ]
      },
      {
        type: 'input',
        name: 'name',
        message: 'What is your component name?'
      }
    ],
    actions: [
      {
        type: 'add',
        path: '../src/components/{{kind}}/{{kebabCase name}}/index.tsx',
        templateFile: 'templates/component.tsx.hbs'
      },
      {
        type: 'add',
        path: '../src/components/{{kind}}/{{kebabCase name}}/style.ts',
        templateFile: 'templates/style.ts.hbs'
      }
    ]
  })
}
