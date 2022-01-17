import { oneline } from '@bscotch/utility';
import { SchemaBuilder } from '@bscotch/schema-builder';
import { versionStoreDefs } from './config/versionStore.js';
import { packageDotJsonDefs } from '@bscotch/schema-lib';

const configDefs = new SchemaBuilder(versionStoreDefs).use(function () {
  return this.addDefinitions(packageDotJsonDefs);
});

const configSchema = configDefs; // TODO
