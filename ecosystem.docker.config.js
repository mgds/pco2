module.exports = {
  apps : [

    {
      name      : "pco2",
      script    : "bin/www",
      cwd       : "/home/node/app/",
      //instances : "2",
      env: {
        NODE_ENV: "development",
        PORT: 8080,
        PORT_HTTPS: 8443,
        CONFIG: "config"
      },
      env_staging : {
        NODE_ENV: "development",
        PORT: 80,
        PORT_HTTPS: 443,
        CONFIG: "configProd"
      },
      env_production : {
        NODE_ENV: "production",
        PORT: 8080,
        PORT_HTTPS: 8443,
        CONFIG: "configAws"
      }
    }
  ]
};
