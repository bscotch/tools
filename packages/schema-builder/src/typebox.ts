import { TKeyOf, TNumber, TRef, TString, TUnion } from '@sinclair/typebox';
import { CustomOptions, TSchema, TValue, UnionKind } from './typebox';
export * from '@sinclair/typebox';

export type SchemaDefs = Record<string, TSchema>;

export type TRecordKey =
  | TString
  | TNumber
  | TKeyOf<any>
  | TUnion<any>
  | TRef<TString | TNumber | TKeyOf<any> | TUnion<any>>;

/**
 * Additional type for `enum` schemas, created by
 * providing an array of literals.
 *
 * *Extension to TypeBox*
 */
export type StaticLiteralUnion<T extends readonly TValue[]> = {
  [K in keyof T]: T[K] extends TValue ? T[K] : never;
}[number];

/**
 *
 * Additional type for `enum` schemas, created by
 * providing an array of literals.
 *
 * *Extension to TypeBox*
 */
export interface TLiteralUnion<T extends TValue[]>
  extends TSchema,
    CustomOptions {
  $static: StaticLiteralUnion<T>;
  kind: typeof UnionKind;
  enum: T;
}

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
