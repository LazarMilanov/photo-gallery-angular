const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  data: Buffer,
  contentType: String,
  filename: String
});

module.exports = mongoose.model('File', fileSchema);