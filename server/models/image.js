const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const imageSchema = new Schema({
    imageUrl: {
        type: String,
        required: true
    },
    _authorId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    description: String,
});

module.exports = mongoose.model("image", imageSchema);