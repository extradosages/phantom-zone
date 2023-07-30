import { readFileSync } from "fs";
import { load as yamlStringToObject } from "js-yaml";
import { z } from "zod";

import { ErrorWithContext } from "../errors";
import { IncrementalConfigLoader } from "./types";

/**
 * Build a config loader which loads environment variables from a yaml file directly.
 * 
 * The loader will complain if any variables have incorrect types based on the parser,
 * but will not complain if any are missing.
 * 
 * @param parser 
 * @param filePath 
 * @returns 
 */
export const yamlFileLoader = (parser: z.AnyZodObject, filePath: string): IncrementalConfigLoader => {
  const load = (): Record<string, unknown> => {

    // Load the object into memory
    const yamlString = String(readFileSync(filePath));
    const value = yamlStringToObject(yamlString);

    // This is a forward warning if we've gotten any of the types wrong but it won't tell us if
    // something is missing; that's at the end of the parsing sequence
    const parsed = parser.deepPartial().safeParse(value);
    if (!parsed.success) {
      throw new ErrorWithContext('Issue sourcing config from yaml file', { filePath, value: value, issues: parsed.error.issues });
    }

    return parsed.data;
  }

  return {
    type: 'yamlFile',
    load,
  }
}
