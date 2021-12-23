import { EmptyObject, JsonSchemaType } from '@bscotch/utility';

/**
 * Configuration details for a single package.
 * Should work according to Cosmic Config for
 * package name `informer`.
 *
 * @see https://github.com/davidtheclark/cosmiconfig
 */
export interface InformerConfig {
  tags?: string[];
  audiences?: string[];
  types?: string[];
  /**
   * Given a choice of value in one field, provide
   * defaults for other fields.
   */
  defaults?: EmptyObject;
  /**
   * JSON Schema for additional data to be obtained
   * from the release notes.
   */
  dataSchema?: JsonSchemaType<{ [field: string]: string | number | boolean }>;
}
