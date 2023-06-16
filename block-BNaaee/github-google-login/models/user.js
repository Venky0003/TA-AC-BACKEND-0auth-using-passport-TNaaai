let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    githubProfile: {
      displayName: { type: String },
    },
    googleProfile: {
      displayName: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);







