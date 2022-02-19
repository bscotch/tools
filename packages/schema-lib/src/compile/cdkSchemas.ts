/**
 * @file The AWS CDK library is partially typed. This file
 * contains functions to convert fetched information
 * (via the AWS CLI) into types and schemas to make the
 * AWS CDK library easier to use.
 */

// TODO
// 1. Convert all of the merged data into proper SCHEMAS and, from there, TYPES.
// 2. Somehow include a "recommended" list of options that should be set
// 3. Move into a separate package for CDK extensions
// 4. Separate this compiler into a different CLI command to allow for calling *without* also fetching sample data and to allow for specifying the target SolutionStack

import { assert, writeJsonFileSync } from '@bscotch/utility';
import { execSync } from 'child_process';
import fetch from 'node-fetch';
import { isDeepStrictEqual } from 'util';

interface SolutionStackList {
  SolutionStacks: string[];
  SolutionStackDetails: {
    SolutionStackName: string;
    PermittedFileTypes: string[];
  }[];
}

interface SolutionStackOption {
  Namespace: string;
  Name: string;
  ChangeSeverity: string;
  UserDefined: boolean;
  DefaultValue: string;
  ValueType: // Replace 'List' with 'CommaSeparatedList' in data
  | 'List'
    | 'Scalar'
    | 'Boolean'
    | 'Json'
    | 'CommaSeparatedList'
    | 'KeyValueList';
  ValueOptions?: string[];
  MinValue?: number;
  MaxValue?: number;
  MaxLength?: number;
  Regex?: string;
}

interface SolutionStackConfig {
  SolutionStackName: string;
  PlatformArn: string;
  Options: SolutionStackOption[];
}

interface ElasticbeanstalkEnvConfigSetting {
  ResourceName: string;
  Namespace: string;
  OptionName: string;
  Value: string;
}

interface ElasticbeanstalkEnvConfig {
  SolutionStackName: string;
  PlatformArn: string;
  ApplicationName: string;
  Description: string;
  EnvironmentName: string;
  DeploymentStatus: string;
  DateCreated: string;
  DateUpdated: string;
  OptionSettings: ElasticbeanstalkEnvConfigSetting[];
}

type ElasticbeanstalkEnvOptionInfo = {
  Namespace: string;
  Name: string;
  Description: string;
  Default: string;
  'Valid values': string;
};

/**
 * Pulled from the AWS CDK types for reference. This is the data structure
 * that needs to be provided when setting Elasticbeanstalk options via the
 * CDK.
 */
interface OptionSettingProperty {
  /**
   * A unique namespace that identifies the option's associated AWS resource.
   *
   * @external
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-beanstalk-option-settings.html#cfn-beanstalk-optionsettings-namespace
   */
  namespace: string;
  /**
   * The name of the configuration option.
   *
   * @external
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-beanstalk-option-settings.html#cfn-beanstalk-optionsettings-optionname
   */
  optionName: string;
  /**
   * A unique resource name for the option setting.
   *
   * Use it for a time–based scaling configuration option.
   *
   * @external
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-beanstalk-option-settings.html#cfn-elasticbeanstalk-environment-optionsetting-resourcename
   */
  resourceName?: string;
  /**
   * The current value for the configuration option.
   *
   * @external
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-beanstalk-option-settings.html#cfn-beanstalk-optionsettings-value
   */
  value?: string;
}

type CompoundLookup<T> = {
  [group: string]: T | CompoundLookup<T>;
};

/**
 * Convert an array of objects into a single object,
 * such that each initial object can be found under a nested
 * (compound) key based on its values for a series of fields.
 *
 * @example
 * const arr = [
 *   {field1:'value1',field2:'value2'},
 *   {field1:'value3',field2:'value4'},
 *   {field1:'value1',field2:'value5'},
 * ];
 * arrayToIndexedObjects(arr, ['field1', 'field2']);
 */
function createCompoundLookup<
  T extends Record<string, any>,
  By extends keyof T,
>(arr: T[], fieldNames: By[]): CompoundLookup<T> {
  const grouped = {} as CompoundLookup<T>;
  for (const item of arr) {
    let subGroup = grouped;
    for (let i = 0; i < fieldNames.length; i++) {
      const fieldName = fieldNames[i];
      const value = item[fieldName];
      if (typeof value != 'string') {
        // Then this item won't even be included because it
        // IS NOT GROUPABLE
        console.error(
          `Expected field ${fieldName} to be a string, but got ${value}`,
        );
        break;
      }
      // If last field, then we're at the array for storing items,
      // else we're at another subgroup.
      const isLastField = i == fieldNames.length - 1;
      // Ensure that the next structure exists
      subGroup[value] ||= isLastField ? item : {};
      if (!isLastField) {
        subGroup = subGroup[value] as CompoundLookup<T>;
      }
    }
  }
  return grouped;
}

function getLatestDockerSolutionStack() {
  const latestDockerStackPattern =
    /^64bit Amazon Linux 2 v(?<version>\d+\.\d+\.\d+) running Docker$/;

  const listing = JSON.parse(
    execSync('aws elasticbeanstalk list-available-solution-stacks').toString(),
  ) as SolutionStackList;
  const dockerStacks = listing.SolutionStacks.filter((s) =>
    s.match(latestDockerStackPattern),
  );
  assert(
    dockerStacks.length === 1,
    `Found multiple Docker stacks: ${dockerStacks}`,
  );
  return dockerStacks[0];
}

function getSolutionStackConfigOptions(solutionStackName: string) {
  const config = JSON.parse(
    execSync(
      `aws elasticbeanstalk describe-configuration-options --solution-stack-name "${solutionStackName}"`,
    ).toString(),
  ) as SolutionStackConfig;
  return config.Options;
}

function markdownTableToObjects<Entry extends Record<string, string>>(
  table: string,
  options?: {
    cleanHeader?: (header: string) => string;
    cleanValue?: (value: string) => string;
  },
): Entry[] {
  const rowStrings = table.trim().split('\n');
  const rows = rowStrings.map((row) => {
    const columns = row.trim().split(/\s*\|\s*/);
    // First and last will be empty, so remove them
    columns.shift();
    columns.pop();
    return columns;
  });
  const headers = rows
    .shift()
    ?.map((header) =>
      options?.cleanHeader ? options.cleanHeader(header) : header,
    ) as (keyof Entry)[];
  assert(headers?.length, 'No headers found');

  const headerBreakRow = rows.shift()!;
  assert(
    headerBreakRow.every((col) => col.match(/^-+$/)),
    'Header break row is not all dashes',
  );

  const asObjects = rows.map((row) => {
    return headers.reduce((obj, header, i) => {
      if (typeof row[i] === 'undefined') {
        return obj;
      }
      const value = options?.cleanValue ? options.cleanValue(row[i]) : row[i];
      if (value === undefined) {
        return obj;
      }
      // @ts-ignore
      obj[header] = value;
      return obj;
    }, {} as Partial<Entry>);
  });

  return asObjects as Entry[];
}

/**
 * Fetch the raw Markdown source documentation for Elasticbeanstalk
 * environment configuration options. It's unclear if this file is
 * in some way auto-generated, so it should be treated as supplemental
 * data but not strictly as the source of truth.
 *
 * See the [human-friendly docs](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/command-options-general.html)
 *
 * See the [markdown source](https://raw.githubusercontent.com/awsdocs/aws-elastic-beanstalk-developer-guide/main/doc_source/command-options-general.md)
 */
async function parseOptionDocs() {
  const sourceUrl =
    'https://raw.githubusercontent.com/awsdocs/aws-elastic-beanstalk-developer-guide/main/doc_source/command-options-general.md';
  const content = await fetch(sourceUrl).then((r) => r.text());
  const sections = content.split(/^##\s.*/gm);
  sections.shift(); // Get rid of the preamble

  const options: ElasticbeanstalkEnvOptionInfo[] = [];
  const namespaces: { namespace: string; description: string }[] = [];

  for (const section of sections) {
    const [description, namespace, tableString] = section.split(
      /^\*\*Namespace: `(.*)`.*$/m,
    );
    namespaces.push({
      description: description.trim().replace(/\\/g, ''),
      namespace,
    });
    options.push(
      ...markdownTableToObjects<ElasticbeanstalkEnvOptionInfo>(tableString, {
        cleanHeader(header) {
          return header.replace(/^[*]*(.*?)[*]*$/, '$1');
        },
        cleanValue(value) {
          return value.replace(/^[*`]*(.*?)[*`]*$/, '$1').replace(/\\/g, '');
        },
      }).map((option) => ({ ...option, Namespace: namespace })),
    );
  }
  return {
    namespaces,
    options,
  };
}

function getSampleConfigValues(appName: string, envName: string) {
  const sample = JSON.parse(
    execSync(
      `aws elasticbeanstalk describe-configuration-settings --environment-name "${envName}" --application-name "${appName}"`,
    ).toString(),
  ) as { ConfigurationSettings: ElasticbeanstalkEnvConfig[] };
  const values = sample.ConfigurationSettings[0].OptionSettings;
  return values;
}

type NestedOption<T> = {
  [namespace: string]: { [option: string]: T };
};

type OptionDefinitions = NestedOption<SolutionStackOption>;
type NamespaceDescriptions = { [namespace: string]: { description: string } };
type OptionDocs = NestedOption<ElasticbeanstalkEnvOptionInfo>;
type OptionSamples = NestedOption<ElasticbeanstalkEnvConfigSetting>;

interface OptionSummary {
  name: string;
  type: string;
  description: string;
  rules: {
    default?: string;
    /** If has same choice as someone else */
    choicesRef?: { namespace: string; name: string };
    choices?: string[];
    // Whether or not the sample contains this option
    sample?: boolean;
    min?: SolutionStackOption['MinValue'];
    max?: SolutionStackOption['MaxValue'];
    pattern?: string;
    maxlength?: SolutionStackOption['MaxLength'];
  };
}

interface OptionsSummary {
  namespace: string;
  description: string;
  options: OptionSummary[];
}

function summarizeOptions(
  namespaceDescriptions: NamespaceDescriptions,
  definitions: OptionDefinitions,
  docs: OptionDocs,
  samples: OptionSamples,
) {
  // Collect exhaustive list of field values to ensure
  // comprehensive type information.
  const choiceLists: string[][] = [];
  const choiceListRefs: Map<string[], { namespace: string; name: string }[]> =
    new Map();
  const namespaces = Object.keys(definitions);

  // The `definitions` are the source of truth, so we want to
  // compile everything relative to that.
  const summaries: OptionsSummary[] = [];

  for (const namespace of namespaces) {
    const summary: OptionsSummary = {
      namespace,
      description: namespaceDescriptions[namespace]?.description,
      options: [],
    };
    for (const optionName of Object.keys(definitions[namespace])) {
      const definition = definitions[namespace][optionName];

      const { type, choices } = cleanDefinition(definition);

      // Many "sample" values are the same as the default, so
      // only mention those that exist and are different.
      const sample =
        samples[namespace]?.[optionName]?.Value == definition.DefaultValue
          ? undefined
          : true;

      const defaultValue =
        definition.DefaultValue === '' ? undefined : definition.DefaultValue;

      const option: OptionSummary = {
        name: optionName,
        description: docs[namespace]?.[optionName]?.Description,
        type,
        rules: {
          choices,
          default: defaultValue,
          sample,
          min: definition.MinValue,
          max: definition.MaxValue,
          pattern: definition.Regex,
          maxlength: definition.MaxLength,
        },
      };
      if (option.rules.choices) {
        const hasMatch = choiceLists.find((choiceList) =>
          isDeepStrictEqual(option.rules.choices, choiceList),
        );
        if (!hasMatch) {
          choiceLists.push(option.rules.choices);
          choiceListRefs.set(option.rules.choices, []);
        }
        choiceListRefs
          .get(hasMatch || option.rules.choices)!
          .push({ namespace, name: optionName });
      }
      summary.options.push(option);
    }
    summaries.push(summary);
  }
  const repeatedChoiceLists: {
    choices: string[];
    refs: { namespace: string; name: string }[];
  }[] = [];
  for (const [choiceList, refs] of choiceListRefs.entries()) {
    if (refs.length > 1) {
      repeatedChoiceLists.push({
        choices: choiceList,
        refs,
      });
    }
  }

  writeJsonFileSync('tmp.json', repeatedChoiceLists);

  return summaries;
}

function cleanDefinition(definition: SolutionStackOption) {
  // There are some "Scalar" types whos values are listed
  // as "true" or "false", thus making them BOOLEANS
  let type = definition.ValueType;
  if (isDeepStrictEqual(definition.ValueOptions, ['true', 'false'])) {
    type = 'Boolean';
  } else if (type == 'List') {
    // This seems to be the same thing as a "CommaSeparatedList",
    // but the latter is more common, so presumably "List" is legacy.
    type = 'CommaSeparatedList';
  }

  const choices = type != 'Boolean' ? definition.ValueOptions : undefined;
  return { type, choices };
}

export async function createCdkSchemasAndTypes() {
  const stackName = getLatestDockerSolutionStack();
  const optionDefinitions = createCompoundLookup(
    getSolutionStackConfigOptions(stackName),
    ['Namespace', 'Name'],
  ) as OptionDefinitions;

  const _docs = await parseOptionDocs();
  const namespaceDescriptions = createCompoundLookup(_docs.namespaces, [
    'namespace',
  ]) as NamespaceDescriptions;
  const optionDocs = createCompoundLookup(_docs.options, [
    'Namespace',
    'Name',
  ]) as OptionDocs;

  const optionSamples = createCompoundLookup(
    getSampleConfigValues('rumpus', 'rumpus-www'),
    ['Namespace', 'OptionName'],
  ) as OptionSamples;

  const summaries = summarizeOptions(
    namespaceDescriptions,
    optionDefinitions,
    optionDocs,
    optionSamples,
  );

  writeJsonFileSync('options-summary.json', summaries);

  // // Create as a JSON Schema to allow exporting as types *with comments*
  // const schema: JsonSchemaType<ElasticbeanstalkEnvOptionValues> = {
  //   title: "Elasticbeanstalk Env Option Values",
  //   description: "Configuration option values and explanations, organized by namespace, then option name, and finally allowed values.",
  //   type: "object",
  //   additionalProperties: {
  //     type: "object",
  //     description: ""
  //   }
  // }
}
