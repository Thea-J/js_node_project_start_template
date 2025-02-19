// Start the server and view your project: npm start
// View it in browser: http://localhost:8080

import { default as axios } from "./node_modules/axios";

const getApiUrl = "https://api.potterdb.com/v1/characters";

// Get Method
// axios
//   .get(getApiUrl)
//   .then((response) => {
//     handleData(response.data.data);
//     // console.log("response", response.data.data);
//     // return response.json;
//   })
//   //   .then((data) => console.log("data", data))
//   .catch((error) => console.log("error", error));

// function handleData(data) {
//   console.log("data", data);
// }

// Post Method
const hermioneId = "9a992090-02b8-4c89-9e6a-bdaa32404c69";
const postApiUrl = `https://api.potterdb.com/v1/characters/${hermioneId}`;

const updatedData = { name: "Thea", born: "2025" };
axios
  .post(apiUrl, updatedData)
  .then((response) => {
    console.log("response", response);
  })
  .catch((error) => console.log("error", error));
