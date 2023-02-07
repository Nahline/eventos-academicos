import fs  from 'fs';


export const loggingMiddleware = (req, res, next) => {
    const logMessage = `Request Type: ${req.method} --- Request URL: ${req.originalUrl} \n`
    console.log(logMessage)

    fs.appendFile("requests.log", logMessage, (err) => {
        if (err) {
            console.log(err);
        }
    });

    next()
}

export const authMiddleware = (req, res, next) => {
    

    next()
}


module.exports = { loggingMiddleware, authMiddleware }