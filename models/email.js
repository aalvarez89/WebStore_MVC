class EmailAPI {
    key = ""
    domain = ""

    constructor() {
        this.key = "469b44efd39bdd0f2608923bc3468dab-87c34c41-46b6c200"
        this.domain = "sandbox1dc437fb415d4a98a38f885197e80940.mailgun.org"
    }

    getKey() {
        return this.key;
    }
    getDomain() {
        return this.domain;
    }
}

module.exports = EmailAPI;