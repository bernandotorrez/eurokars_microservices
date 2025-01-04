const getHeaders = (req) => ({
    headers: {
        'Eurokars-Auth-Token': req.header('Eurokars-Auth-Token') ?? ''
    }
});

module.exports = getHeaders;