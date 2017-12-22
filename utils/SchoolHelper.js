const SchoolHelper = {
    validateEmail(email) {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    },

    mapNonSuspendedStudentsIntoEmails(students) {
        return students
            .filter(student => this.filterSuspendedStudent(student))
            .map(student => student.email);
    },

    filterSuspendedStudent(student) {
        if (student) {
            return !student.suspended
        }
        return false;
    }
}

module.exports = SchoolHelper;
