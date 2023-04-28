require("dotenv").config();
const fetch = require("node-fetch");
const Easypost = require("@easypost/api");

const api = new Easypost(process.env.EASYPOST_TEST_API_KEY); // when testing, your EasyPost test API key here
const evriKey = process.env.EVRI_LOCATOR_API_KEY;
// const api = new Easypost(process.env.EASYPOST_PRODUCTION_API_KEY); // when in production, your EasyPost Prod API key here
global.fetch = fetch;
global.Headers = fetch.Headers;

//get parcelShopId from Evri Locator API
let myHeaders = new fetch.Headers();
myHeaders.append("apiKey", evriKey);

var requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow",
};

let postCode = "CR2 6HR"; // the post code where you want to pick up your parcel

async function getParcelShopId() {
  //fetch a valid parcel shop id from the Evri parcelShop API.
  const response = await fetch(
    `https://api.hermesworld.co.uk/enterprise-parcelshop-api/v1/parcelshop?postcode=${postCode}&distance=20&count=10`,
    requestOptions
  );

  const result = await response.json();
  for (i = 0; i < result.length; i++) {
    if (result[i].locationType === "ParcelShop") {
      shopId = result[i].parcelShopId;
      createEasyPostShipment(shopId);
      return;
    }
  }
}

async function createEasyPostShipment(shopId) {
  //   console.log(shopId);
  let shipment = await api.Shipment.create({
    parcel: {
      length: 5, //inches
      width: 5,
      height: 5,
      weight: 48, //ounces
    },
    from_address: {
      street1: "Weymouth Mews",
      street2: "",
      city: "London",
      state: "",
      zip: "W1G 7EE",
      country: "GB",
      name: "test name",
      company: "test company",
    },
    to_address: {
      street1: "27 Newark Rd",
      street2: "",
      city: "South Croydon",
      state: "",
      zip: "CR2 6HR",
      country: "GB",
      name: "test name",
      company: "test company",
      carrier_facility: shopId, // Evri parcelShopId goes here
    },
    reference: "myshipmentreference",
    carrier_accounts: [process.env.EASYPOST_EVRI_CARRIER_ACCOUNT_ID], // your EasyPost Evri Carrier Account ID goes here
    options: {
      label_format: "PNG",
      label_size: "4x6",
      hold_for_pickup: true, //required option for the Shop2Shop service. Otherwise Shop2Home services will be available
    },
  });

  //   console.log(shipment);
  //buy shipment by lowest rate where `carrier` is Evri and `service` is Shop2Shop.
  const boughtShipment = await api.Shipment.buy(
    shipment.id,
    shipment.lowestRate(["Evri"], ["Shop2Shop"])
  );

  console.log(boughtShipment);
}

getParcelShopId();
