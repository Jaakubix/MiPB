const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Request = sequelize.define('Request', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    processType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    initiator: {
        type: DataTypes.STRING, // Storing name for now to match legacy, or use relationship
        allowNull: false
    },
    department: {
        type: DataTypes.STRING,
        allowNull: true // The current department this request is "in"
    },
    currentNode: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Active'
    },
    data: {
        type: DataTypes.JSON, // Store form data as JSON
        defaultValue: {}
    },
    history: {
        type: DataTypes.JSON, // Store history array
        defaultValue: []
    }
});

module.exports = Request;
