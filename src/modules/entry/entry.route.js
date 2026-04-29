const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const entryValidation = require('./entry.validation');
const entryController = require('./entry.controller');

const router = express.Router();

router
    .route('/')
    .post(auth('entry.create'), validate(entryValidation.createEntry), entryController.createEntry);

router.post(
    '/completed',
    auth('entry.view'),
    validate(entryValidation.getAlCompletedlEntries),
    entryController.getAlCompletedlEntries
);

router.get(
    '/pending',
    auth('entry.view'),
    validate(entryValidation.getAlPendingEntries),
    entryController.getAlPendinglEntries
);

router.post(
    '/pending',
    auth('entry.view'),
    validate(entryValidation.getAllPendingEntriesWithinDateRange),
    entryController.getAllPendingEntriesWithinDateRange
);

router
    .route('/:id')
    .get(auth('entry.view'), validate(entryValidation.getEntryById), entryController.getEntryById)
    .patch(auth('entry.edit'), validate(entryValidation.updateEntry), entryController.updateEntryById)
    .delete(auth('entry.delete'), validate(entryValidation.getEntryById), entryController.deleteEntryBy);

module.exports = router;
