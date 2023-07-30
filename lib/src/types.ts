import { ZodTypeAny, z } from 'zod';

export type EnvSpec = {
  doc: string;
  format: String;
  env: string;
  default: undefined;
};

export type Parser<T> = z.ZodType<T, {}, string>;

export type ConfigVar<T> = {
  envSpec: EnvSpec;
  parser: Parser<T>;
} & { _type: 'ConfigVar' };

type Height0 = ConfigVar<any>;

type Height1 = {
  [key: string]: Height0
}

type Height2 = {
  [key: string]: Height1 
    | Height0
}

type Height3 = {
  [key: string]: Height2 
    | Height1 
    | Height0
}

type Height4 = {
  [key: string]: Height3 
    | Height2 
    | Height1 
    | Height0
}

type MaxHeight = Height4;

export type Schema = Height4 
  | Height3 
  | Height2 
  | Height1 
  | Height0
  
export type SubSchema = Exclude<Schema, MaxHeight>;

export type Config<T> = T extends ConfigVar<infer U>
  ? U
  : T extends Exclude<Schema, Height0>
    ? { [K in keyof T]: Config<T[K]> }
    : never;
