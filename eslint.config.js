import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		}
	},
	{
		ignores: ['build/', '.svelte-kit/', 'dist/']
	},
	{
		rules: {
			'@typescript-eslint/no-explicit-any': 'warn', // or 'off'
			'@typescript-eslint/explicit-module-boundary-types': 'warn',
			'@typescript-eslint/no-unused-vars': 'warn',
			'@typescript-eslint/no-empty-interface': 'warn',
			'@typescript-eslint/no-non-null-assertion': 'warn',

			//'@typescript-eslint/no-unnecessary-condition': 'warn',
			//'@typescript-eslint/explicit-function-return-type': 'warn',
			//'@typescript-eslint/strict-boolean-expressions': 'warn',
			//'@typescript-eslint/no-unsafe-member-access': 'warn',
			//'@typescript-eslint/no-unsafe-assignment': 'warn',
			//'@typescript-eslint/no-unnecessary-type-assertion': 'warn',
			//'@typescript-eslint/prefer-optional-chain': 'warn',

			//'@typescript-eslint/dot-notation': 'warn',
			//'typescript-eslint/no-error-on-untyped-function-signatures': 'warn'
		}
	}
];
