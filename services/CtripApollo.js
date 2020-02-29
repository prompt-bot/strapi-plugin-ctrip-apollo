'use strict';

/**
 * Email.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const _ = require('lodash');

const getDefaultSystemConfig = (key, defaultValue) => {
  return _.get(strapi.plugins,`ctrip-apollo.config.${key}`, defaultValue)
}

const createDefaultEnvConfig = async env => {
  const pluginStore = strapi.store({
    environment: env,
    type: 'plugin',
    name: 'ctrip-apollo',
  });

  const value = {
    host: getDefaultSystemConfig('host','http://127.0.0.1:8080'),
    appId: getDefaultSystemConfig('appId',''),
    cluster: getDefaultSystemConfig('cluster','default'),
    namespace: getDefaultSystemConfig('namespace','application'),
  }

  await pluginStore.set({ key: 'config', value });
  return await strapi
    .store({
      environment: env,
      type: 'plugin',
      name: 'ctrip-apollo',
    })
    .get({ key: 'config' });
};

const getConfig = async env => {
  let config = await strapi
    .store({
      environment: env,
      type: 'plugin',
      name: 'ctrip-apollo',
    })
    .get({ key: 'config' });

  if (!config) {
    config = await createDefaultEnvConfig(env);
  }

  return config;
};

module.exports = {
  getConfig
};
