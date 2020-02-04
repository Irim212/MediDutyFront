import axios from "axios";

var jwt_decode = require("jwt-decode");

export default {
  auth: {
    isAuthenticated: false,
    token: null,
    user: null,
    authenticate(token) {
      this.isAuthenticated = true;
      this.token = token;
      this.user = jwt_decode(token);

      localStorage.setItem("token", token);

      axios.interceptors.response.use(
        response => response,
        error => {
          console.log(error.response);
          if (error.response.status === 401) {
            this.logout();
          }
          return Promise.reject(error);
        }
      );

      axios.defaults.headers.common["authorization"] = `Bearer ${this.token}`;
    },
    logout() {
      this.isAuthenticated = false;
      this.token = null;
      this.user = undefined;

      delete axios.defaults.headers.common["authorization"];

      localStorage.removeItem("token");
    },
    isAdministrator() {
      return (
        this.user !== undefined &&
        this.user !== null &&
        this.user.role.indexOf("administrator") >= 0
      );
    },
    isHeadmaster() {
      return (
        this.user !== undefined &&
        this.user !== null &&
        this.user.role.indexOf("headmaster") >= 0
      );
    }
  }
};
