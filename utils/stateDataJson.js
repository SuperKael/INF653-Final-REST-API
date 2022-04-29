const path = require('path');
const fs = require('fs');

function loadStaticStateData(stateCode = null) {
    let statesData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'models', 'states.json')));
    return stateCode ? statesData.find(stateData => stateData.code == stateCode) : statesData;
}

module.exports = {
    loadStaticStateData
}