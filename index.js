// Get the data for the single object with id=7

function showSingleCard(data) {
  const mainContent = document.getElementById("main");
  const techCard = document.createElement("p");
  techCard.innerHTML = `${data.name} costing £${data.data.price}`;
  mainContent.appendChild(techCard);
}

// using .then
function fetchData() {
  const macBookProURL = "https://api.restful-api.dev/objects";
  axios
    .get(macBookProURL)
    .then((response) => {
      // console.log("response.headers", response.headers["content-type"])
      //   console.log("data", response.data);
      //   console.log("status code", response.status);
      //   showSingleCard(response.data);
      // Convert object ➡️ Map
      const dataMap = new Map(Object.entries(response.data));
      console.log("dataMap", dataMap);

      const count = 0;
      // iterate over MAp
      for (const [id, item] of dataMap) {
        // count no. of tech has a price > 120
        console.log("data", value.data.color);
        if (item.data) {
          let price = item.data.price || item.data.Price;
          if (price && Number(price) > 120) {
            count++;
          }
        }
      }
    })
    .catch((error) => console.log("get error", error));
}

fetchData();

function postData(newData) {
  const postURL = "https://api.restful-api.dev/objects";
  axios
    .post(postURL, newData)
    .then((response) => {
      // console.log("response.headers", response.headers["content-type"])
      //   console.log("POST data", response.data);
      //   console.log("POST status code", response.status);
      showSingleCard(response.data);
    })
    .catch((error) => console.log("post error", error));
}

const newData = {
  name: "new tech phone",
  data: {
    year: 2025,
    price: 72000000,
    "CPU model": "Intel Core i9",
    "Hard disk size": "1 TB",
  },
};
postData(newData);
