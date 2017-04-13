
  var findUserByEmail = function (users, email){

    for (let k in users){
      let user = users[k];
      if (email === user.email){
        return user;
      }
    }
    return null;
  }

  module.exports = findUserByEmail;
