'use strict';

const apollo = require('ctrip-apollo');
const _ = require('lodash');
const { loadConfig } =require('strapi/lib/core')

const updateConfig = (key, value) => {
  key = key.replace(/\./g, '_').toUpperCase()
  process.env[key] = value
}

// 重载配置信息
const reloadConfigInfo = async () => {
  if (strapi) {
    config = await loadConfig(strapi)
    _.merge(strapi.config, config)
  }
}

module.exports = async (whitStrapiCore = false) => {
  // strapi.log.info('Plugin: [ctrip Apollo] loading...')

  let config = await strapi
    .store({
      environment: strapi.config.environment,
      type: 'plugin',
      name: 'ctrip-apollo',
    })
    .get({ key: 'config' })

  if (!config) {
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
    strapi.log.info(`apollo key update: %s: %s => %s`, key, oldValue, newValue)
    updateConfig(key, newValue)
    await reloadConfigInfo()
  })

  ns.on('add', async ({
    key,
    value
  }) => {
    strapi.log.info(`apollo key add: %s: %s`, key, value)
    updateConfig(key, value)
    await reloadConfigInfo()
  })

  ns.on('delete', async ({
    key,
    value
  }) => {
    strapi.log.info(`apollo key delete: %s: %s`, key, value)
    updateConfig(key)
    await reloadConfigInfo()
  })

  ns.on('fetch-error', (err) => {
    strapi.log.error(`apollo fetch-error: %s`, err.message)
  })

  await ns.ready()
  strapi.plugins['ctrip-apollo'].config.ns = ns 
  _.map(ns['_config'], (value, key) => {
    updateConfig(key, value)
  })
  await reloadConfigInfo()
  strapi.log.info('Plugin: [ctrip Apollo] load ready.')
};
