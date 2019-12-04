module.exports = {
  apps : [

    // First application
    {
      name      : 'pco2',
      script    : 'bin/www',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_staging : {
        NODE_ENV: 'development',
        PORT: 80
      },
      env_production : {
        NODE_ENV: 'production',
        PORT: 80
      }
    },
    {
      name      : 'pco2-dev',
      script    : 'bin/www',
      cwd       : '/public/mgg/web/dev.paleo-pco2.org/',
      env : {
        NODE_ENV: 'development',
        PORT: 80
      }
    },
    {
      name      : 'pco2-prod',
      script    : 'bin/www',
      cwd       : '/public/mgg/web/www.paleo-pco2.org/',
      env: {
        NODE_ENV: 'production',
        PORT: 80
      },
      env_staging: {
        NODE_ENV: 'development',
        PORT: 80
      }
    }
  ]//,

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  /*deploy : {
    production : {
      user : 'jmorton',
      host : '129.236.29.65',
      ref  : 'origin/master',
      repo : 'git@github.com:mgds/OceanVideoLab-API.git',
      path : '/public/mgg/web/www.paleo-pco2.org',
      'post-deploy' : 'npm install && pm2 startOrRestart ecosystem.config.js --env production'
    },
    dev : {
      user : 'jmorton',
      host : '129.236.29.78',
      ref  : 'origin/master',
      repo : 'git@github.com:mgds/OceanVideoLab-API.git',
      path : '/public/mgg/web/dev.paleo-pco2.org',
      'post-deploy' : 'npm install && pm2 startOrRestart ecosystem.config.js --env dev',
      env  : {
        NODE_ENV: 'development',
        PORT: 3000
      }
    }
  }*/
};
