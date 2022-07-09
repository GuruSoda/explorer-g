const statusMessages = {
    '200': 'Done',
    '201': 'Created',
    '400': 'Invalid format',
    '500': 'Internal error'
}

function success (req, res, message, status) {
    res.status(status || 200).send({
        error: '',
        body: message || statusMessages[status || 200]
    })
}

function error (req, res, message, status, details) {
    console.error('[response error] ' + details);

    res.status(status || 500).send({
        error: message,
        body: ''
    })
}

module.exports = {
    success,
    error
}
