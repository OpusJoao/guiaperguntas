const Sequelize = require('sequelize')

const connection = new Sequelize('guiaperguntas','root','root',{
    host: '192.168.0.109',
    dialect: 'mysql'
})

module.exports = connection