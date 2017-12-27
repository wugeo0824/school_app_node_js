const mongoose = require('mongoose');

const { Schema } = mongoose;

const StudentSchema = new Schema({
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, "student email can't be blank"],
        match: [/\S+@\S+\.\S+/, 'student email is invalid'],
        index: true
    },

    suspended: { type: Boolean, default: false },

}, { runSettersOnQuery: true });

StudentSchema.methods.suspend = function () {
    this.suspended = true;
    return this.save();
};

module.exports = mongoose.model('Student', StudentSchema);
