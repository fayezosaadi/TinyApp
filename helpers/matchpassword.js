
  var findUserByEmail = function (users, pass){
    for (let k in users){
      let user = users[k];
      if (pass === user.password){
        return user; //object: includes : ID, email, and password
      }
    }
    return null;
  }
  module.exports = findUserByEmail;

