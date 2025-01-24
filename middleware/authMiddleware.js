const jwt = require("jsonwebtoken")

/**
 * User jwt middleware
 *
 * @param {e.Request} req
 * @param {e.Response} res
 * @param {e.NextFunction} next
 */
exports.jwtUserMiddleware = (req, res, next) => {
    const {
        token
    } = req.headers

    // optional path for jwt
    if (req.route.path === '/getInfluencer' && !token) {
        return next()
    } else if (!token) {
        return res.status(400).json({
            message: "Token in headers is required"
        })
    }

    jwt.verify(token, process.env.JWTUSERSECRETTOKEN, (err, jwtData) => {
        if (err) {
            console.log('jwt error', err)

            return res.status(401).json({
                message: "Failed to verify token",
                error: err,
            })
        }

        if (process.env.JWTUSERIDENTIFIER !== jwtData.role) {
            return res.status(403).json({
                message: "role unverified"
            })
        }

        res.locals.jwtData = jwtData

        next()
    })
}

/**
 * Influencer jwt middleware
 *
 * @param {e.Request} req
 * @param {e.Response} res
 * @param {e.NextFunction} next
 */
exports.jwtInfluencerMiddleware = (req, res, next) => {
    // const {
    //     token
    // } = req.headers

    if (req.headers.authorization === undefined) {
        return res.status(400).json({
            message: "Bearer token is required"
        })
    }
    const token = req.headers.authorization.split(" ")[1]

    if (!token) {
        return res.status(400).json({
            message: "Token in headers is required"
        })
    }
    jwt.verify(token, process.env.JWTINFLUENCERSECRETTOKEN, (err, jwtData) => {
        if (err) {
            return res.status(401).json({
                message: "Failed to verify token",
                error: err
            })
        }

        if (process.env.JWTINFLUENCERIDENTIFIER !== jwtData.role) {
            console.log(process.env.JWTINFLUENCERIDENTIFIER, jwtData.role)
            return res.status(403).json({
                message: "role unverified"
            })
        }

        res.locals.jwtData = jwtData

        next()
    })
}

