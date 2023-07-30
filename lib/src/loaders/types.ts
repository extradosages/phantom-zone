export type IncrementalConfigLoader = {
  type: string;
  load: () => Record<string, unknown>;
};
