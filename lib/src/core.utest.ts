import * as pz from './core';
import * as fix from './core.fix';

describe("project", () => {
  test("loads config file", () => {
    fix.writeBasicConfigToFile()

    const config = pz.project(fix.basicSchema, [fix.basicConfigFilePath]);
    
    expect(config).toStrictEqual(fix.basicConfig);
  });
  
  test("loads multiple config files and merges in order", () => {
    fix.writeBasicConfigToFile()
    fix.writeBasicConfigRevisedToFile()

    const config = pz.project(
      fix.basicSchema,
      [fix.basicConfigFilePath, fix.basicConfigFileRevisedPath],
    );

    expect(config.var4).toBe(fix.basicConfigRevisedVar4Val);
  })
    
  test("loads config variables from environment", () => {
    fix.writeBasicConfigToFile()
    fix.exportVar5ToEnv()

    const config = pz.project(
      fix.basicSchema,
      [fix.basicConfigFilePath]
    );

    expect(config.var5).toBe(fix.var5ValFromEnv);
    
    fix.resetVar5InEnv()
  })
  
  test("does not have a problem if it cant load a file", () => {
    fix.writeBasicConfigToFile()

    const config = pz.project(
      fix.basicSchema,
      [fix.basicConfigFilePath, fix.badFilePath]
    )
    
    expect(config).toStrictEqual(fix.basicConfig);
  })
})