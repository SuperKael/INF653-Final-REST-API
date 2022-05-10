const express = require('express');
const router = express.Router();
const statesController = require('../controllers/statesController');

router.route('/')
    .get(statesController.getStates);

router.use('/:state', require('../middleware/stateData'));

router.route('/:state')
    .get(statesController.getState);

router.route('/:state/funfact')
    .get(statesController.getStateFunFact)
    .post(statesController.postStateFunFact);

router.route('/:state/:property')
    .get(statesController.getStateProperty);

module.exports = router;