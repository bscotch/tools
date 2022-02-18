import { assert, writeJsonFileSync } from '@bscotch/utility';
import { execSync } from 'child_process';
import fetch from 'node-fetch';

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
  ValueType: string;
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

// TODO: Also get SAMPLE VALUES to compare to types
//
// TODO: Create some sort of output type
// that will maximally help populating the CDK
// options, e.g. a nested thing allowing for:
//
// namespaces "aws:elb:loadbalancer", "aws:elasticbeanstalk:xray",
//
// `populateOption("aws:elasticbeanstalk:xray", "XRayEnabled", "true", resourceName);`

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

/**
 * The data structure that needs to be provided when setting Elasticbeanstalk
 * options via the CDK.
 */
interface OptionSetting {
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

type NestedGroup<T> = {
  [group: string]: T | NestedGroup<T>;
};

function groupByFields<T extends Record<string, any>, By extends keyof T>(
  arr: T[],
  fieldNames: By[],
): NestedGroup<T> {
  const grouped = {} as NestedGroup<T>;
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
        subGroup = subGroup[value] as NestedGroup<T>;
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
    default: string;
    choices?: string[];
    sample?: string;
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
  const types: Set<string> = new Set();
  const choiceLists: string[][] = [];
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
      const option: OptionSummary = {
        name: definition.Name,
        description: docs[namespace]?.[optionName]?.Description,
        type: definition.ValueType,
        rules: {
          choices: definition.ValueOptions,
          default: definition.DefaultValue,
          sample:
            samples[namespace]?.[optionName]?.Value == definition.DefaultValue
              ? undefined
              : samples[namespace]?.[optionName]?.Value,
          min: definition.MinValue,
          max: definition.MaxValue,
          pattern: definition.Regex,
          maxlength: definition.MaxLength,
        },
      };
      summary.options.push(option);
    }
    summaries.push(summary);
  }
  return summaries;
}

export async function createCdkSchemasAndTypes() {
  const stackName = getLatestDockerSolutionStack();
  const optionDefinitions = groupByFields(
    getSolutionStackConfigOptions(stackName),
    ['Namespace', 'Name'],
  ) as OptionDefinitions;

  const _docs = await parseOptionDocs();
  const namespaceDescriptions = groupByFields(_docs.namespaces, [
    'namespace',
  ]) as NamespaceDescriptions;
  const optionDocs = groupByFields(_docs.options, [
    'Namespace',
    'Name',
  ]) as OptionDocs;

  const optionSamples = groupByFields(
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
