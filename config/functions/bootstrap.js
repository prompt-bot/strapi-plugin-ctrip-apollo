'use strict';

const { loadConfig } = require('strapi/lib/core')
const apollo = require('ctrip-apollo');
const _ = require('lodash');

// 更新配置信息
const updateConfig = (key, value) => {

  strapi.config.set(key, value)
  key = key.replace(/\./g, '_').toUpperCase()
  process.env[key] = value

  strapi.log.info(`Plugin: [ctrip Apollo] update process.env.${key} = ${value}`)
}

// 重载配置信息
const reloadConfigInfo = async (boot = false) => {
    let config = await loadConfig(strapi)
    _.merge(strapi.config, config)
}

module.exports = async () => {
  let config = await strapi
    .store({
      environment: strapi.config.environment,
      type: 'plugin',
      name: 'ctrip-apollo',
    })
    .get({ key: 'config' })

  if (!config) {
    strapi.log.error('Plugin: [ctrip Apollo]  can`t found apollo config, please config in admin or preset environment.')
    return
  }

  config.cachePath = '.cache/apollo'

  const app = apollo(config)
  const ns = app.cluster(config.cluster).namespace(config.namespace)
  
  ns.on('change', async ({
    key,
    oldValue,
    newValue
  }) => {
    strapi.log.info(`Plugin: [ctrip Apollo] received update: %s: %s => %s`, key, oldValue, newValue)
    updateConfig(key, newValue)
    await reloadConfigInfo()
  })

  ns.on('add', async ({
    key,
    value
  }) => {
    strapi.log.info(`Plugin: [ctrip Apollo] received add: %s: %s`, key, value)
    updateConfig(key, value)
    await reloadConfigInfo()
  })

  ns.on('delete', async ({
    key,
    value
  }) => {
    strapi.log.info(`Plugin: [ctrip Apollo] received delete: %s: %s`, key, value)
    updateConfig(key)
    await reloadConfigInfo()
  })

  ns.on('fetch-error', (err) => {
    strapi.log.error(`Plugin: [ctrip Apollo]  fetch-error: %s`, err.message)
  })

  await ns.ready()
  strapi.plugins['ctrip-apollo'].config.ns = ns
  _.map(ns['_config'], (value, key) => {
    updateConfig(key, value)
  })
  strapi.log.info(' ')
  await reloadConfigInfo(true)

  strapi.log.info('Plugin: [ctrip Apollo] load ready.')
};
