const mongoose = require('mongoose');
const State = require('../models/State');

/**
 * Gets information for many states
 * @type {import("express").RequestHandler}
 */
async function getStates(req, res) {
    const states = await State.find().exec();
    
    let mergedStates = require('../utils/stateDataJson').loadStaticStateData().map(stateData => {
        // Object spread syntax merges stateData with the matching entry in the states array.
        // If no such matching entry exists, spread syntax ignores the undefined value.
        let mergedState = {
            ...stateData,
            ...states.find(state => state.stateCode == stateData.code)
        }
        // Since the state code is expected to be returned as 'code', which comes from the static state data,
        // the stateCode property from the state entry in MongoDB is deleted.
        delete mergedState.stateCode;
        return mergedState;
    });

    // If the contig query parameter is specified, filters the states appropriately
    if (req?.query?.contig != null) {
        let contig = req.query.contig.toLowerCase() == 'true';
        mergedStates = mergedStates.filter(stateData => (stateData.code == 'AK' || stateData.code == 'HI') != contig);
    }

    res.json(mergedStates);
}

/**
 * Gets information for a specific state
 * @type {import("express").RequestHandler}
 */
async function getState(req, res) {
    // req.stateData comes from the stateData middleware
    res.json(req.stateData);
}

/**
 * Gets a specific property for a specific state
 * @type {import("express").RequestHandler}
 */
async function getStateProperty(req, res) {
    if (!req?.params?.property) {
        return res.status(400).json({ 'message': 'State property is required' });
    }

    // Map to deal with inconsistent language in state properties
    const statePropertyAliases = new Map([
        ["capital", "capital_city"],
        ["admission", "admission_date"],
        ["admitted", "admission_date"]
    ]);
    // Map to deal with more inconsistent language, now for the response label
    const statePropertyLabels = new Map([
        ["capital_city", "capital"],
        ["admission_date", "admitted"]
    ]);

    let property = req.params.property.toLowerCase();
    if (statePropertyAliases.has(property)) {
        property = statePropertyAliases.get(property);
    }

    if (req.stateData[property] == null) {
        return res.status(404).json({ 'message': 'Invalid state property' });
    }

    let label = statePropertyLabels.has(property) ? statePropertyLabels.get(property) : property

    // req.stateData comes from the stateData middleware
    res.json({
        'state': req.stateData.state,
        [label]: req.stateData[property]
    });
}

/**
 * Gets a random 'fun fact' for a specific state
 * @type {import("express").RequestHandler}
 */
async function getStateFunFact(req, res) {
    // req.stateData comes from the stateData middleware
    res.json(req.stateData);

    if (!req.stateData.funfacts || !req.stateData.funfacts.length) {
        return res.status(404).json({ 'message': 'No Fun Facts found for ' + req.stateData.state });
    }
}

module.exports = {
    getStates,
    getState,
    getStateProperty
}