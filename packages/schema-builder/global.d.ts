export * from '@sinclair/typebox';

declare module '@sinclair/typebox' {
  // Extend the default options for TypeBox for
  // things like VSCode's non-standard extensions.
  export interface CustomOptions {
    // VSCode extensions
    /**
     * **VSCode Only**
     *
     * https://code.visualstudio.com/docs/languages/json#_define-snippets-in-json-schemas
     */
    defaultSnippets?: {
      label?: string;
      description?: string;
      /**
       * An object that will be JSON stringified
       */
      body?: any;
      /**
       * An already stringified JSON object that can contain new lines (\n) and tabs (\t)
       */
      bodyText?: string;
    }[];
    /**
     * **VSCode Only**
     */
    errorMessage?: string;
    /**
     * **VSCode Only**
     */
    patternErrorMessage?: string;
    /**
     * **VSCode Only**
     */
    deprecationMessage?: string;
    /**
     * **VSCode Only**
     */
    markdownDeprecationMessage?: string;
    /**
     * **VSCode Only**
     */
    enumDescriptions?: string[];
    /**
     * **VSCode Only**
     */
    markdownEnumDescriptions?: string[];
    /**
     * **VSCode Only**
     */
    markdownDescription?: string;
    /**
     * **VSCode Only**
     */
    doNotSuggest?: boolean;
    /**
     * **VSCode Only**
     */
    suggestSortText?: string;
    /**
     * **VSCode Only**
     */
    allowComments?: boolean;
    /**
     * **VSCode Only**
     */
    allowTrailingCommas?: boolean;
  }
}
