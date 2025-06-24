const {Sequelize} = require('sequelize')

module.exports = new Sequelize(
    'telegabotdb',
    'root',
    'root',
    {
        host: '5.188.129.118',
        port: '5432',
        dialect: 'postgres'
    }
)