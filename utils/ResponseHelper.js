module.exports = {
    badRequest(res, msg) {
        res.status(400)
            .json({
                success: false,
                message: msg
            });
    },
    
    handleError(statusCode, err, res) {
        res.status(statusCode)
            .json({
                success: false,
                message: err.message
            });
    },

    successWithJsonBody(res, body) {
        res.json({
            success: true,
            body
        })
    }
}