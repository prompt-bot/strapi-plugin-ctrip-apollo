'use strict';
/**
 * CtripApollo.js controller
 *
 * @description: A set of functions called "actions" of the `ctrip-apollo` plugin.
 */

const _ = require('lodash');


module.exports = {

  getEnvironments: async ctx => {
    const environments = _.map(
      _.keys(strapi.config.environments),
      environment => {
        return {
          name: environment,
          active: strapi.config.environment === environment,
        };
      }
    );

    ctx.send({ environments });
  },

  getSettings: async ctx => {
    let config = await strapi.plugins['ctrip-apollo'].services.ctripapollo.getConfig(
      ctx.params.environment
    );
    strapi.log.info(strapi.config.currentEnvironment.customName)
    strapi.log.info(process.env.CUSTOMNAME)
    ctx.send({
      config,
    });
  },

  updateSettings: async ctx => {
    await strapi
      .store({
        environment: ctx.params.environment,
        type: 'plugin',
        name: 'ctrip-apollo',
      })
      .set({ key: 'config', value: ctx.request.body });

    ctx.send({ ok: true });
  },

  /**
   * reload app action, danger action.
   *
   * @return {Object}
   */

  reload: async (ctx) => {
    await strapi.reload()
    ctx.send({
      message: 'ok'
    });
  }
};
