const State = require('../models/State');

// Loads stateData for a given state into req.stateData
const stateData = async (req, res, next) => {
    if (!req?.params?.state) {
        return res.status(400).json({ 'message': 'State abbreviation parameter is required' });
    }

    let stateCode = req.params.state.toUpperCase();

    // Read state data from states.json
    const staticState = require('../utils/stateDataJson').loadStaticStateData(stateCode);

    // Read state data from MongoDB
    const state = await State.findOne({ 'stateCode': stateCode }).lean();

    // If both sources of data return nothing, then the code must be invalid.
    if (!staticState && !state) {
        return res.status(400).json({ 'message': 'Invalid state abbreviation parameter' });
    }

    // Object spread syntax merges the two state objects.
    // If either state object does not exist, spread syntax ignores the undefined value.
    let mergedState = {
        ...staticState,
        ...state
    }

    // Since the state code is expected to be returned as 'code', which comes from the static state data,
    // the stateCode property from the state entry in MongoDB is deleted.
    delete mergedState.stateCode;

    console.log(mergedState)

    req.stateData = mergedState;

    next();
}

module.exports = stateData