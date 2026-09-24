const auth = require('./auth');
module.exports = {
  protect: auth.authenticateToken,
  authorize: auth.authorizeRoles
};
