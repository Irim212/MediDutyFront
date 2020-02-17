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
          if (error.response) {
            console.log(error.response);
            if (error.response.status === 401) {
              this.logout();
            }
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
      if (this.user === null || this.user === undefined) {
        return false;
      }

      if (typeof this.user.role === "string") {
        return this.user.role.toLowerCase() === "administrator";
      } else {
        return this.user.role.some(x => x.toLowerCase() === "administrator");
      }
    },
    isHeadmaster() {
      if (this.user === null || this.user === undefined) {
        return false;
      }

      if (typeof this.user.role === "string") {
        return this.user.role.toLowerCase() === "headmaster";
      } else {
        return this.user.role.some(x => x.toLowerCase() === "headmaster");
      }
    }
  },
  wards: [
    "Oddział Anestezjologii",
    "Oddział Chirurgii",
    "Oddział Chorób Płuc i Chemioterapii",
    "Oddział Kardiologiczny",
    "Oddział Neurologiczny"
  ],
  districts: [
    "dolnośląskie",
    "kujawsko-pomorskie",
    "lubelskie",
    "lubuskie",
    "łódzkie",
    "małopolskie",
    "mazowieckie",
    "opolskie",
    "podkarpackie",
    "podlaskie",
    "pomorskie",
    "śląskie",
    "świetokrzyskie",
    "warmińso-mazurskie",
    "wielkopolskie",
    "zachodniopomorskie"
  ]
};
