var User = require('../models/user');

module.exports= {
    userInfo: (req, res, next) => {
        let userId = req.session && req.session.userId;
        if (userId) {
          User.findById(userId, 'username').then((user) => {
            req.user = user;
            res.locals.user = user;
            next();
          });
        } else {
          req.user = null;
          res.locals.user = null;
          next();
        }
      }
}