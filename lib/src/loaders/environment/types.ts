import { z } from 'zod';

type Prefix<Key extends string | undefined> = Key extends string
    ? `${Uppercase<Key>}_`
    : '';

type Kernel2<Value extends Record<string, any>> = {
    [Key in keyof Value]: Key extends string
        // Not sure why ts can't figure out this is a string
        ? `${Kernel1<Key, Value[Key]>}`
        : never
};

type Kernel1<Key extends string | undefined, Value> = Value extends Record<string, any>
    ? `${Prefix<Key>}${Kernel2<Value>[keyof Kernel2<Value>]}`
    : never;

/**
 * If the input is a nested record, this produces a type which is exactly all the paths to
 * leaves, labelled by the keys to those paths, mapped to uppercase, and separated by `_`.
 */
export type KeysToAllCapsCase<Value extends Record<string, any>> = Kernel1<undefined, Value>;

export type ReformatVars<T extends z.AnyZodObject> = T['shape'] extends Record<string, any>
    ? Record<KeysToAllCapsCase<T['shape']>, string>
    : never;

/**
 * An flat representation of the config parsers, indexed by their paths in the config.
 */
export type ParserPaths = Map<string[], z.ZodTypeAny>;
