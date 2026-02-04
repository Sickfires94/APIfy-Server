const logLevels = Object.freeze({
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    DEBUG: 'debug',
    TRACE: 'trace',
});

const httpStatusCodeCategories = Object.freeze({
    IN_PROGRESS: 'inProgress',
    SUCCESS: 'Success',
    CLIENT_ERROR: 'Client Error',
    SERVER_ERROR: 'Server Error',
});

const logTimeUnit = Object.freeze({
    HOUR: 'hours',
    DAY: 'days',
    MONTH: 'months',
})

export {logLevels, httpStatusCodeCategories, logTimeUnit};