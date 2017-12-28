const mongoose = require('mongoose');

const { Schema } = mongoose;

const TeacherSchema = new Schema({
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, "teacher email can't be blank"],
        match: [/\S+@\S+\.\S+/, 'teacher email is invalid'],
        index: true
    },

    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
    }],

}, { runSettersOnQuery: true });

module.exports = mongoose.model('Teacher', TeacherSchema);
