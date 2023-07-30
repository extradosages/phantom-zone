import _ = require("lodash");
import { z } from "zod";

import { ErrorWithContext } from "./errors";
import { IncrementalConfigLoader } from "./loaders/types";

/**
 * Incrementally load config from a sequence of sources, then amalgamate and parse the resulting
 * data with zod.
 *
 * @param parser
 * @param incrementalLoaders
 * @returns
 */
export const project = <T extends z.AnyZodObject>(
  parser: T,
  incrementalLoaders: IncrementalConfigLoader[]
): z.infer<T> => {
  let value: Record<string, unknown> = {};
  for (const loader of incrementalLoaders) {
    value = _.merge(value, loader.load());
  }

  const parsed = parser.safeParse(value);
  if (!parsed.success) {
    throw new ErrorWithContext("Issue parsing accumulated config", {
      value,
      issues: parsed.error.issues,
    });
  }
  return parsed.data;
};
