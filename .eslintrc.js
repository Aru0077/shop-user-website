module.exports = {
      root: true,
      env: {
            browser: true,
            node: true,
            es2021: true,
      },
      extends: [
            'plugin:vue/vue3-recommended',
            'eslint:recommended',
            '@vue/typescript/recommended',
            'prettier',
            'plugin:prettier/recommended',
      ],
      parserOptions: {
            ecmaVersion: 2021,
            parser: '@typescript-eslint/parser',
      },
      rules: {
            'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
            'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            'vue/multi-word-component-names': 'off',
            'prettier/prettier': [
                  'error',
                  {
                        singleQuote: true,
                        semi: false,
                        tabWidth: 2,
                        trailingComma: 'all',
                        printWidth: 100,
                        bracketSpacing: true,
                        arrowParens: 'avoid',
                        endOfLine: 'auto',
                  },
            ],
      },
}