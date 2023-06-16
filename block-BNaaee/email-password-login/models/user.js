let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let bcrypt = require('bcrypt');


let userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true , minlength: 8},
  },
  { timestamps: true }
);

userSchema.pre('save', function (next) {
  if (this.password && this.isModified('password')) {
    bcrypt.hash(this.password, 10, (err, hashed) => {
      if (err) return next(err);
      this.password = hashed;
      return next();
    });
  } else {
    next();
  }
});

// userSchema.methods.verifyPassword = function (password, cb) {
//   bcrypt.compare(password, this.password, (err, result) => {
//     return cb(err, result);
//   });
// };
userSchema.methods.verifyPassword = function (password) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = mongoose.model('User', userSchema);
