import * as convict from 'convict';
import * as yaml from 'js-yaml';
import { z } from 'zod';

import { Config, Parser, Schema, SubSchema, ConfigVar } from './types';

// Teach convict how to load a yaml file
convict.addParser({ extension: ['yaml'], parse: yaml.load });

export const configVar = <T>(doc: string, env: string, parser: Parser<T>): ConfigVar<T> => ({
  _type: 'ConfigVar',
  envSpec: {
    default: undefined,
    doc,
    env,
    format: '*',
  },
  parser,
});

// Could've used a zod parser for this
const isConfigVar = <T>(data: Schema): data is ConfigVar<T> => data?._type === 'ConfigVar';

const schemaToZod = <T extends Schema>(schema: T): z.ZodType<Config<T>> => {
  let layer: z.ZodRawShape = {};
  for (const key in schema) {
    const value = schema[key] as unknown as Schema;
    
    if (isConfigVar(value)) {
      layer[key] = value.parser;
    } else {
      layer[key] = schemaToZod(value);
    }
  }
  
  return z.object(layer) as unknown as Config<T>;
}

const schemaToConvict = <T extends Schema>(schema: T) => {
  let layer: Record<string, any> = {};
  for (const key in schema) {
    const value = schema[key] as unknown as Schema;

    if (isConfigVar(value)) {
      layer[key] = value.envSpec;
    } else {
      layer[key] = schemaToConvict(value);
    }
  }
  
  return layer;
}

const maxDepth = 4;

const depth = <T extends Schema>(schema: T, currDepth = 0): number => {
  if (isConfigVar(schema)) {
    return currDepth;
  }
  let layer: number = 0;
  for (const key in schema) {
    const value = schema[key] as unknown as SubSchema;
    layer = Math.max(depth(value, currDepth + 1), layer)
  }
  return layer;
}

export const project = <T extends Schema>(schema: T, filePathSequence: string[]): Config<T>  => {
  const schemaDepth = depth(schema);
  if (schemaDepth > maxDepth) {
    throw new Error(`Config schema depth (${schemaDepth}) exceeds maximum depth (${maxDepth}); ` +
      `type inference may be wrong; adjust schema or submit a PR to the library to increase the ` +
      `maximum depth`);
  }

  // Load config from environment using schema
  const loader = convict(schemaToConvict(schema));

  for (const path in filePathSequence) {
    try {
      // Load ad-hoc config
      loader.loadFile(path);
    } catch {
      // Do nothing
    }
  }
  
  // Parser loaded config with zod
  return schemaToZod(schema).parse(loader.getProperties());
}
