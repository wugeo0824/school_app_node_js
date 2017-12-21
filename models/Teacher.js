var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TeacherSchema = new Schema({
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, "can't be blank"],
        match: [/\S+@\S+\.\S+/, 'is invalid'],
        index:true
    },

    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],

}, { runSettersOnQuery: true });

module.exports = mongoose.model('Teacher', TeacherSchema);