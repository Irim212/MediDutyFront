var jwt_decode = require("jwt-decode");

export default {
  auth: {
    isAuthenticated: false,
    token: null,
    user: null,
    authenticate(token) {
      this.isAuthenticated = true;
      this.token = token;
      localStorage.setItem('token', token);
      this.user = jwt_decode(token);
    },
    logout() {
      this.isAuthenticated = false;
      this.token = null;
      localStorage.setItem('token', undefined);
      this.user = undefined;
    },
    isAdministrator() {
      return this.user !== undefined && this.user !== null && this.user.role.indexOf("administrator") >= 0;
    },
    isHeadmaster() {
      return this.user !== undefined && this.user !== null && this.user.role.indexOf("headmaster") >= 0;
    }
  },
  API: 'http://localhost:5000/api'
}