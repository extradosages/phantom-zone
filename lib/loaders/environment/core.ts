import _ = require("lodash");
import { z } from "zod";
import { ErrorWithContext } from "../../errors";
import { IncrementalConfigLoader } from "../types";
import { KeysToAllCapsCase, ParserPaths } from "./types";

// Zod object type guard
const hasZodShape = (x: unknown): x is { shape: Record<string, unknown> } =>
  // @ts-expect-error this is a type guard-- I'm allowed to do whatever I want
  !!x.shape;

// A recursive function for flattening a parser and keying the leaf parsers by the path
// to those parsers in the shape of the parser
const flattenParser = (parser: z.AnyZodObject): ParserPaths => {
  const flat: ParserPaths = new Map();

  if (hasZodShape(parser)) {
    for (const key of Object.keys(parser.shape)) {
      const subFlat = flattenParser(parser.shape[key]);

      for (const [subPath, subParser] of subFlat.entries()) {
        const path = [key, ...subPath];
        flat.set(path, subParser);
      }
    }
  } else {
    flat.set([], parser);
  }

  return flat;
};

const defaultEnvironmentKernel = (parser: unknown): unknown => {
  if (hasZodShape(parser)) {
    return Object.fromEntries(
      Object.entries(parser.shape).map(([key, value]) => [
        key,
        defaultEnvironmentKernel(value),
      ])
    );
  }
  return undefined;
};

const defaultEnvironment = (parser: z.AnyZodObject): Record<string, unknown> =>
  defaultEnvironmentKernel(parser) as Record<string, unknown>;

/**
 * Build a loader that sources config from the environment.
 *
 * Environment variable names will automatically be derived from a passed parser. Environment
 * variable names can be manually renamed by passing a record which maps the expected
 * variable name to the desired one as the second argument.
 *
 * The loader will complain if any of the variable have the incorrect type based on the parser,
 * but will not complain if they are missing.
 *
 * @param parser
 * @param renameVars
 * @returns
 */
export const environmentLoader = <T extends z.AnyZodObject>(
  parser: T,
  renameVars?: Record<KeysToAllCapsCase<T["shape"]>, string>
): IncrementalConfigLoader => {
  const load = () => {
    let environment = defaultEnvironment(parser);

    const flat = flattenParser(parser);

    for (const [path, subParser] of flat.entries()) {
      // This is the default formatting for our paths
      // WARNING: Notice the type assertion below
      const defaultName = path
        .map((x) => x.toUpperCase())
        .join("_") as KeysToAllCapsCase<T["shape"]>;
      // If there's an entry for reformatting the variable, prefer that over the default
      const variableName = renameVars?.[defaultName] || defaultName;

      // Get the value from the environment
      const value = process.env[variableName];

      // This is a forward warning if we've gotten any of the types wrong but it won't tell us if
      // something is missing; that's at the end of the parsing sequence
      const parsed = subParser.optional().safeParse(value);
      if (!parsed.success) {
        throw new ErrorWithContext(
          {
            variableName,
            value,
            issues: parsed.error.issues,
          },
          "Issue sourcing config from environment"
        );
      }

      environment = _.set(environment, path, parsed.data);
    }

    return environment;
  };

  return {
    type: "environment",
    load,
  };
};
