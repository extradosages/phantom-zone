import * as fs from 'fs';

import { z } from 'zod';
import * as pz from './core';

export const basicSchema = {
  node1: {
    node2: {
      var1: pz.configVar('node1.node2.var1', 'VAR1', z.string()),
    },
    var2: pz.configVar('node1.var2', 'VAR2', z.string()),
  },
  var3: pz.configVar('var3', 'VAR3', z.string()),
  var4: pz.configVar('var4', 'VAR4', z.string()),
  var5: pz.configVar('var5', 'VAR5', z.string()),
}

export const basicConfig = {
  node1: {
    node2: {
      var1: 'var1val'
    },
    var2: 'var2val'
  },
  var3: 'var3val',
  var4: 'var4val',
  var5: 'var5val',
};

const basicConfigFileContents = `
node1:
  node2:
    var1: '${basicConfig.node1.node2.var1}'
  var2: '${basicConfig.node1.var2}'
var3: '${basicConfig.var3}'
var4: '${basicConfig.var4}'
var5: '${basicConfig.var5}'
`;

export const basicConfigFilePath = '/tmp/basicConfigFile.yaml';

export const writeBasicConfigToFile = () => {
  fs.writeFileSync(basicConfigFilePath, basicConfigFileContents);
}

const { var4, ...mostOfBasicConfig } = basicConfig;

export const basicConfigRevisedVar4Val = 'var4valrevised';

export const basicConfigRevised = {
  ...mostOfBasicConfig,
  var4: basicConfigRevisedVar4Val,
}

const basicConfigRevisedFileContents = `
var4: ${basicConfigRevisedVar4Val}
`;

export const basicConfigFileRevisedPath = '/tmp/basicConfigRevisedFile.yaml';

export const writeBasicConfigRevisedToFile = () => {
  fs.writeFileSync(basicConfigFileRevisedPath, basicConfigRevisedFileContents);
}

export const var5ValFromEnv = 'var5ValFromEnv';

export const exportVar5ToEnv = () => {
  process.env['VAR5'] = var5ValFromEnv;
}

export const resetVar5InEnv = () => {
  delete process.env['VAR5']
}

export const badFilePath = "/tmp/i-dont-exist.yaml";