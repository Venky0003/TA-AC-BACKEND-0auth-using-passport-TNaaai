var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

var userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String},
    githubProfile: {
      displayName: { type: String },
      name: { type: String }, 
    },
    googleProfile: {
      displayName: { type: String },
      name: { type: String }, 
    },
  },
  { timestamps: true }
);
userSchema.methods.getFullName = function() {
  return this.firstName + ' ' + this.lastName;
}; 

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

userSchema.methods.verifyPassword = function (password, cb) {
    bcrypt.compare(password, this.password, (err, result) =>{
        return cb(err, result);
    })
}

module.exports = mongoose.model('User', userSchema);
