const jwt = require('jsonwebtoken');

const authorize = (req, res, next) => {
    const authorization = req.headers['authorization'];
    if (authorization) {
        const token = authorization.replace('Token ', '').replace('token ', '');
        try {
            const decoded = jwt.verify(token, config.jwtSecret);
            req.userId = decoded.sub.userId;
            req.role = decoded.sub.role;
            req.uemail = decoded.sub.uemail;
            req.user_name = decoded.sub.user_name;
            req.uname = decoded.sub.uname;
            if (decoded) {
                return next();
            }
        } catch (e) {
           
                return res.status(400).send({ error: 'Token Expired', message: 'Authentication failed.' });
            
        }
    }else{
       
            return res.status(400).send({ error: 'Unauthorized', message: 'Authentication failed.' });
    
        
    }
}

 module.exports =  authorize;
// module.exports =   softphone_authorize;
