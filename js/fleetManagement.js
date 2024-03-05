const zoneDropdown = document.getElementById("zoneDropdown");
const wardDropdown = document.getElementById("wardDropdown");
// const kothiDropdown = document.getElementById("kothiDropdown");
const vendorDropdown = document.getElementById("vendorDropdown");
const liveVehicleDropdown = document.getElementById("liveVehicleDropdown");
const historyVehicleDropdown = document.getElementById(
  "historyVehicleDropdown"
);
const geofenceDropdown = document.getElementById("geofenceDropdown");
const startDate = document.getElementById("startDate");
const endDate = document.getElementById("endDate");

const btnGroupPlay = document.getElementById("btnGroupPlay");
const btnGroupStop = document.getElementById("btnGroupStop");

const btnLivePlay = document.getElementById("btnLivePlay");
const btnLiveStop = document.getElementById("btnLiveStop");

const btnHistoryPlay = document.getElementById("btnHistoryPlay");
const btnHistoryShow = document.getElementById("btnHistoryShow");

const btnShowGeofence = document.getElementById("btnShowGeofence");

const btnClearMap = document.getElementById("btnClearMap");

const zoneApi = "http://13.200.33.105/SWMServiceLive/SWMService.svc/GetZone";
const wardApi = "http://13.200.33.105/SWMServiceLive/SWMService.svc/GetWard";
// const kothiApi = "http://13.200.33.105/SWMServiceLive/SWMService.svc/GetKothi";
const commonApi =
  "http://13.200.33.105/SWMServiceLive/SWMService.svc/CommonMethod";

const geoJsonFile = "./service/geofence.geojson";
var filteredLayer = null;
var isPlaying = false;

var dotMarkerLayer = L.layerGroup();
var routeLayer = L.layerGroup();

// Map

let config = {
  minZoom: 8,
  maxZoom: 18,
  fullscreenControl: true,
};
var map = L.map("map", config).setView([18.523204, 73.852011], 13);
var marker, marker1;

const truckmain = `./Images/truckmain.png`;
const doti = `./Images/dot.png`;
const degreei = `./Images/degree.png`;
const REDFEEDER = `./Images/REDFEEDER.png`;
const BLUEFEEDER = `./Images/BLUEFEEDER.png`;
const truck = `./Images/1truckblue.png`;
const truckr = `./Images/truckr.png`;
const truckw = `./Images/truckw.png`;
const trucki = `./Images/trucki.png`;
const truckin = `./Images/truckin.png`;
const truckP = `./Images/truckP.png`;
const truckb = `./Images/truckb.png`;
const truckn = `./Images/truckn.png`;
const green = `./Images/greenflag.png`;
const red = `./Images/redflag.png`;

var osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright"></a>',
}).addTo(map);

var trucklive = L.icon({
  iconUrl: truckmain,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});
var truckIcon = L.icon({
  iconUrl: truck,
  iconSize: [30, 60],
  iconAnchor: [15, 30],
});
var degree = L.icon({
  iconUrl: degreei,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});
var dot = L.icon({
  iconUrl: doti,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

var greenflag = L.icon({
  iconUrl: green,
  iconSize: [40, 40],
  iconAnchor: [10, 40],
});

var redflag = L.icon({
  iconUrl: red,
  iconSize: [40, 40],
  iconAnchor: [10, 40],
});

var dotMarkerLayer = L.layerGroup();
var myfIconLayer = L.layerGroup();
var markerGroup1 = L.layerGroup();
var geofence = L.layerGroup();

var bm = {
  "Base Map": osm,
};

var overlays = {
  GPS_Location: dotMarkerLayer,
  Feeder: myfIconLayer,
  Route: markerGroup1,
  Geofence: geofence,
};

var layerControl = L.control
  .layers(bm, overlays, { collapsed: false })
  .addTo(map);

var controlElement = layerControl.getContainer();
controlElement.style.fontSize = "12px";
controlElement.style.backgroundColor = "#f1f1f1";
controlElement.style.borderRadius = "5px";
controlElement.style.padding = "10px";

dotMarkerLayer.addTo(map);
myfIconLayer.addTo(map);
markerGroup1.addTo(map);
geofence.addTo(map);

var lst_lat,
  lst_lon,
  featureGroup,
  featureGroup1,
  featureGroupp,
  featureGroupb,
  featureGroupn,
  featureGroupw,
  featureGroupi,
  featureGroupin;
var markerGroup = L.featureGroup().addTo(map);
var timeoutIds = [];

let fetchInterval; // Variable to store the fetch interval
let trackInterval;
const runningX = document.getElementById("running");
const waitingX = document.getElementById("waiting");
const idleX = document.getElementById("idle");
const inactiveX = document.getElementById("inactive");
const PowerCutX = document.getElementById("PowerCut");
const BreakdownX = document.getElementById("Breakdown");
const NogpsX = document.getElementById("Nogps");

let isFetching = false;
let isTracking = false;

let markerl;

const animateMarker = (prevLat, prevLon, newLat, newLon) => {
  const markerPosition = [
    [prevLat, prevLon], // Previous position
    [newLat, newLon], // New position from server
  ];

  markerl.slideTo([newLat, newLon], { duration: 4000 });

  // Call fetchMarkerPositions again after 5 seconds
  // setTimeout(trackData, 5000);
};

const setMapView = (lat, lon) => {
  map.setView([lat, lon], 15);
};

const populateZoneDropdown = async () => {
  try {
    const response = await axios.post(zoneApi, {
      mode: 11,
      vehicleId: 0,
      AccId: 11401,
    });

    const zoneMasterList = response.data.GetZoneResult.ZoneMasterList;

    for (const zone of zoneMasterList) {
      const option = document.createElement("option");
      option.value = zone.zoneid;
      option.text = zone.zonename;
      zoneDropdown.appendChild(option);
      zoneDropdown.fstdropdown.rebind();
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const populateWardDropdown = async () => {
  try {
    wardDropdown.innerHTML = '<option value="0">Select Ward</option>';

    const response = await axios.post(wardApi, {
      mode: 12,
      vehicleId: 0,
      AccId: 11401,
      ZoneId: zoneDropdown.value,
    });

    const wardMasterList = response.data.GetWardResult.WardMasterList;

    for (const ward of wardMasterList) {
      const option = document.createElement("option");
      option.value = ward.PK_wardId;
      option.text = ward.wardName;
      wardDropdown.appendChild(option);
      wardDropdown.fstdropdown.rebind();
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

// const populateKothiDropdown = async () => {
//   try {
//     kothiDropdown.innerHTML = '<option value="0">Select Kothi</option>';

//     const response = await axios.post(kothiApi, {
//       mode: 56,
//       Fk_accid: 11401,
//       Fk_ambcatId: 0,
//       Fk_divisionid: 0,
//       FK_VehicleID: 0,
//       Fk_ZoneId: zoneDropdown.value,
//       FK_WardId: wardDropdown.value,
//       Startdate: "",
//       Enddate: "",
//       Maxspeed: 0,
//       Minspeed: 0,
//       Fk_DistrictId: 0,
//       Geoid: 0,
//     });

//     const kothiMasterList = response.data.GetKothiResult.KotiMasterList;

//     for (const kothi of kothiMasterList) {
//       const option = document.createElement("option");
//       option.value = kothi.pk_kothiid;
//       option.text = kothi.kothiname;
//       kothiDropdown.appendChild(option);
//       kothiDropdown.fstdropdown.rebind();
//     }
//   } catch (error) {
//     console.error("Error fetching data:", error);
//   }
// };

const populateVendorDropdown = async () => {
  try {
    vendorDropdown.innerHTML = '<option value="0">Select Vendor</option>';

    const requestData = {
      storedProcedureName: "proc_VehicleDashboardTest",
      parameters: JSON.stringify({
        mode: 5,
        accid: 11401,
        zoneId: zoneDropdown.value,
        WardId: wardDropdown.value,
        vendorid: 0,
        vehicletype: "",
        vehicletype1: "",
      }),
    };

    const response = await axios.post(commonApi, requestData);

    const commonReportMasterList =
      response.data.CommonMethodResult.CommonReportMasterList[0].ReturnValue;

    let dropdownData = JSON.parse(commonReportMasterList);

    for (const data of dropdownData) {
      const option = document.createElement("option");
      option.value = data.Pk_EmpId;
      option.text = data.EmpName;
      vendorDropdown.appendChild(option);
      vendorDropdown.fstdropdown.rebind();
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const populateLiveVehicleDropdown = async () => {
  try {
    liveVehicleDropdown.innerHTML = '<option value="0">Select</option>';

    const requestData = {
      storedProcedureName: "Proc_VehicleMap_1",
      parameters: JSON.stringify({
        Mode: 9,
        UserID: 11401,
        RoleID: 4,
        zoneId: 0,
        WardId: 0,
        zoneName: "default",
        WardName: "default",
      }),
    };

    const response = await axios.post(commonApi, requestData);

    if (!response.data.CommonMethodResult.CommonReportMasterList) return;
    const commonReportMasterList =
      response.data.CommonMethodResult.CommonReportMasterList[0].ReturnValue;

    let dropdownData = JSON.parse(commonReportMasterList);

    for (const data of dropdownData) {
      const option = document.createElement("option");
      option.value = data.PK_VehicleId;
      option.text = data.vehicleName;
      liveVehicleDropdown.appendChild(option);
      liveVehicleDropdown.fstdropdown.rebind();
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const populateGeofenceDropdown = async () => {
  try {
    geofenceDropdown.innerHTML = '<option value="0">Select Geofence</option>';

    const requestData = {
      storedProcedureName: "SP_GET_GEOFENCE_NAME",
      parameters: JSON.stringify({
        mode: 1,
      }),
    };

    const response = await axios.post(commonApi, requestData);

    const commonReportMasterList =
      response.data.CommonMethodResult.CommonReportMasterList[0].ReturnValue;

    let dropdownData = JSON.parse(commonReportMasterList);

    for (const data of dropdownData) {
      const option = document.createElement("option");
      option.value = data.geoname ? data.geoname : "None";
      option.text = data.geoname ? data.geoname : "None";
      geofenceDropdown.appendChild(option);
      // geofenceDropdown.fstdropdown.rebind();
    }
    geofenceDropdown.fstdropdown.rebind();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const populateHistoryVehiDropdown = async () => {
  try {
    historyVehicleDropdown.innerHTML = '<option value="0">Select</option>';

    const requestData = {
      storedProcedureName: "Proc_VehicleMap_1",
      parameters: JSON.stringify({
        Mode: 3,
        UserID: 11401,
        FK_VehicleID: 4,
        zoneId: zoneDropdown.value,
        WardId: wardDropdown.value,
        // sDate: startDate.value,
        // eDate: endDate.value,
      }),
    };

    const response = await axios.post(commonApi, requestData);

    if (!response.data.CommonMethodResult.CommonReportMasterList) return;
    const commonReportMasterList =
      response.data.CommonMethodResult.CommonReportMasterList[0].ReturnValue;

    let dropdownData = JSON.parse(commonReportMasterList);

    for (const data of dropdownData) {
      const option = document.createElement("option");
      option.value = data.PK_VehicleId;
      option.text = data.vehicleName;
      historyVehicleDropdown.appendChild(option);
    }
    historyVehicleDropdown.fstdropdown.rebind();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const getGroupTrackData = async () => {
  try {
    const requestData = {
      storedProcedureName: "Proc_VehicleMap_1",
      parameters: JSON.stringify({
        mode: 14,
        UserID: 11401,
        zoneId: zoneDropdown.value,
        WardId: wardDropdown.value,
        // vendorid: vendorDropdown.value,
        RoleID: 4,
      }),
    };

    console.log(requestData);
    const response = await axios.post(commonApi, requestData);

    if (!response.data.CommonMethodResult.CommonReportMasterList) {
      toast.show();
      return;
    }

    const commonReportMasterList =
      response.data.CommonMethodResult.CommonReportMasterList[0].ReturnValue;

    let data = JSON.parse(commonReportMasterList);
    console.log(data);
    addGroupVehicles(data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const getLiveVehicleLocation = async () => {
  try {
    const requestData = {
      storedProcedureName: "Proc_VehicleMap_1",
      parameters: JSON.stringify({
        mode: 5,
        FK_VehicleID: liveVehicleDropdown.value,
      }),
    };

    console.log(requestData);
    const response = await axios.post(commonApi, requestData);

    if (!response.data.CommonMethodResult.CommonReportMasterList) {
      toast.show();
      return;
    }

    const commonReportMasterList =
      response.data.CommonMethodResult.CommonReportMasterList[0].ReturnValue;

    let data = JSON.parse(commonReportMasterList);
    console.log(data);
    addLiveVehicle(data[0]);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const handleZoneSelect = async (event) => {
  await populateWardDropdown();
  await populateLiveVehicleDropdown();
  await populateHistoryVehiDropdown();
};

const handleWardSelect = async (event) => {
  // await populateKothiDropdown();
  await populateLiveVehicleDropdown();
  await populateHistoryVehiDropdown();
};

// const handleKothiSelect = (event) => {
//   populateSweeperDropdown();
// };

const addGroupVehicles = (data) => {
  if (data.length > 0) {
    // Clear existing markers from the map
    if (featureGroup) {
      map.removeLayer(featureGroup);
    }
    if (featureGroupw) {
      map.removeLayer(featureGroupw);
    }
    if (featureGroup1) {
      map.removeLayer(featureGroup1);
    }
    if (featureGroupi) {
      map.removeLayer(featureGroupi);
    }
    if (featureGroupin) {
      map.removeLayer(featureGroupin);
    }
    if (featureGroupp) {
      map.removeLayer(featureGroupp);
    }
    if (featureGroupb) {
      map.removeLayer(featureGroupb);
    }
    if (featureGroupn) {
      map.removeLayer(featureGroupn);
    }

    // Create a new feature group for the markers
    featureGroup = L.featureGroup();
    featureGroup1 = L.featureGroup();
    featureGroupw = L.featureGroup();
    featureGroupi = L.featureGroup();
    featureGroupin = L.featureGroup();
    featureGroupp = L.featureGroup();
    featureGroupb = L.featureGroup();
    featureGroupn = L.featureGroup();

    // Iterate over the data array
    data.forEach((item) => {
      const lat = item.latitude;
      const lon = item.longitude;
      const status = item.LstRunIdletime;
      const veh = item.vehicleName;
      if (data.length > 0) {
        // Filter the data array based on the status condition

        running = data.filter((item) =>
          item.LstRunIdletime.startsWith("Running")
        );

        Inactive = data.filter((item) =>
          item.LstRunIdletime.startsWith("inactive")
        );

        /* // Count the number of running vehicles */

        Waiting = data.filter((item) =>
          item.LstRunIdletime.startsWith("Waiting")
        );
        PowerCut = data.filter((item) =>
          item.LstRunIdletime.startsWith("PowerCut")
        );
        Breakdown = data.filter((item) =>
          item.LstRunIdletime.startsWith("Brea")
        );
        Nogps = data.filter((item) => item.LstRunIdletime.startsWith("No"));

        Idle = data.filter((item) => item.LstRunIdletime.startsWith("Idle"));

        /* // Count the number of running vehicles */
        const runningCount = running.length;
        const IdleCount = Idle.length;
        const InactiveCount = Inactive.length;
        const WaitingCount = Waiting.length;
        const breakCount = Breakdown.length;
        const NogpsCount = Nogps.length;
        const totalcount = data.length;
        const PowerCutCount = PowerCut.length;
        const runningBtn = document.querySelector("#running span");
        const waitingBtn = document.querySelector("#waiting span");
        const idleBtn = document.querySelector("#idle span");
        const NogpsBtn = document.querySelector("#Nogps span");
        const breakBtn = document.querySelector("#Breakdown span");
        const PowerCutBtn = document.querySelector("#PowerCut span");
        const inactiveBtn = document.querySelector("#inactive span");
        const TotalBtn = document.querySelector("#Total span");

        runningBtn.innerText = runningCount;
        TotalBtn.innerText = totalcount;
        waitingBtn.innerText = WaitingCount;
        idleBtn.innerText = IdleCount;
        inactiveBtn.innerText = InactiveCount;
        NogpsBtn.innerText = NogpsCount;
        PowerCutBtn.innerText = PowerCutCount;
        breakBtn.innerText = breakCount;

        /* // Print the count */
        console.log(
          "running vehicles:",
          runningCount,
          ",WaitingCount:",
          WaitingCount,
          "Idle:",
          IdleCount,
          "InactiveCount",
          InactiveCount
        );

        /* runningBtn.innerText = runningCount; */
      }

      const newLatLng = new L.LatLng(lat, lon);
      let iconUrl = truck; // Default icon URL
      if (status.startsWith("Running")) {
        console.log("Status starts with 'Running'");
        iconUrl = truckr; // Icon URL for "running" status
      } else if (status.startsWith("Waiting")) {
        console.log("Status starts with 'waiting'");
        iconUrl = truckw; // Icon URL for "running" status
      } else if (status.startsWith("Idle")) {
        console.log("Status starts with 'Idle'");
        iconUrl = trucki; // Icon URL for "running" status
      } else if (status.startsWith("inactive")) {
        console.log("Status starts with 'inactive'");
        iconUrl = truckin; // Icon URL for "running" status
      } else if (status.startsWith("PowerCut")) {
        console.log("Status starts with 'PowerCut'");
        iconUrl = truckP; // Icon URL for "PowerCut" status
      } else if (status.startsWith("Break")) {
        console.log("Status starts with 'Brea'");
        iconUrl = truckb; // Icon URL for "Brea" status
      } else if (status.startsWith("No")) {
        console.log("Status starts with 'No'");
        iconUrl = truckn; // Icon URL for "Brea" status
      }
      const myIcon = L.icon({
        iconUrl: iconUrl,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [1, 1],
        // You can also customize other icon properties like shadowUrl, shadowSize, etc.
      });
      // Create a marker for each set of latitude and longitude
      const marker = L.marker([lat, lon], { icon: myIcon });
      marker.bindPopup("Vehicle Name: " + veh);
      // const marker = L.marker([lat, lon]);
      featureGroup.addLayer(marker);
    });

    // Add the feature group to the map
    featureGroup.addTo(map);

    // Fit the map to the bounds of the feature group
    //map.fitBounds(featureGroup.getBounds());

    runningX.addEventListener("click", fetchrundata);

    function fetchrundata() {
      if (featureGroup) {
        map.removeLayer(featureGroup);
      }
      if (featureGroupw) {
        map.removeLayer(featureGroupw);
      }
      if (featureGroup1) {
        map.removeLayer(featureGroup1);
      }
      if (featureGroupi) {
        map.removeLayer(featureGroupi);
      }
      if (featureGroupin) {
        map.removeLayer(featureGroupin);
      }
      if (featureGroupp) {
        map.removeLayer(featureGroupp);
      }
      if (featureGroupb) {
        map.removeLayer(featureGroupb);
      }
      if (featureGroupn) {
        map.removeLayer(featureGroupn);
      }

      running.forEach((item) => {
        const lat = item.latitude;
        const lon = item.longitude;
        const status = item.status;
        const veh = item.vid;
        iconUrl = truckr;
        const RIcon = L.icon({
          iconUrl: iconUrl,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
          popupAnchor: [1, 1],
          // You can also customize other icon properties like shadowUrl, shadowSize, etc.
        });

        const markerR = L.marker([lat, lon], { icon: RIcon });
        markerR.bindPopup("Vehicle Name: " + veh);
        featureGroup1.addLayer(markerR);
        // map.fitBounds(featureGroup1.getBounds());
      });
      featureGroup1.addTo(map);
    }
    NogpsX.addEventListener("click", fetchNogpsdata);

    function fetchNogpsdata() {
      if (featureGroup) {
        map.removeLayer(featureGroup);
      }
      if (featureGroupw) {
        map.removeLayer(featureGroupw);
      }
      if (featureGroup1) {
        map.removeLayer(featureGroup1);
      }
      if (featureGroupi) {
        map.removeLayer(featureGroupi);
      }
      if (featureGroupin) {
        map.removeLayer(featureGroupin);
      }
      if (featureGroupp) {
        map.removeLayer(featureGroupp);
      }
      if (featureGroupb) {
        map.removeLayer(featureGroupb);
      }
      if (featureGroupn) {
        map.removeLayer(featureGroupn);
      }

      Nogps.forEach((item) => {
        const lat = item.latitude;
        const lon = item.longitude;
        const status = item.status;
        const veh = item.vid;
        iconUrl = truckn;
        const NIcon = L.icon({
          iconUrl: iconUrl,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
          popupAnchor: [1, 1],
          // You can also customize other icon properties like shadowUrl, shadowSize, etc.
        });

        const markerN = L.marker([lat, lon], { icon: RIcon });
        markerN.bindPopup("Vehicle Name: " + veh);
        featureGroupn.addLayer(markerN);
        // map.fitBounds(featureGroupn.getBounds());
      });
      featureGroupn.addTo(map);
    }

    BreakdownX.addEventListener("click", fetchbrkdata);

    function fetchbrkdata() {
      if (featureGroup) {
        map.removeLayer(featureGroup);
      }
      if (featureGroupw) {
        map.removeLayer(featureGroupw);
      }
      if (featureGroup1) {
        map.removeLayer(featureGroup1);
      }
      if (featureGroupi) {
        map.removeLayer(featureGroupi);
      }
      if (featureGroupin) {
        map.removeLayer(featureGroupin);
      }
      if (featureGroupp) {
        map.removeLayer(featureGroupp);
      }
      if (featureGroupb) {
        map.removeLayer(featureGroupb);
      }
      if (featureGroupn) {
        map.removeLayer(featureGroupn);
      }
      Breakdown.forEach((item) => {
        const lat = item.latitude;
        const lon = item.longitude;
        const status = item.status;
        const veh = item.vid;
        iconUrl = truckb;
        const bIcon = L.icon({
          iconUrl: iconUrl,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
          popupAnchor: [1, 1],
          // You can also customize other icon properties like shadowUrl, shadowSize, etc.
        });

        const markerb = L.marker([lat, lon], { icon: bIcon });
        markerb.bindPopup("Vehicle Name: " + veh);
        featureGroupb.addLayer(markerb);

        map.fitBounds(featureGroupb.getBounds());
      });
      featureGroupb.addTo(map);
    }

    waitingX.addEventListener("click", fetchwaitdata);

    function fetchwaitdata() {
      if (featureGroup) {
        map.removeLayer(featureGroup);
      }
      if (featureGroupw) {
        map.removeLayer(featureGroupw);
      }
      if (featureGroup1) {
        map.removeLayer(featureGroup1);
      }
      if (featureGroupi) {
        map.removeLayer(featureGroupi);
      }
      if (featureGroupin) {
        map.removeLayer(featureGroupin);
      }
      if (featureGroupp) {
        map.removeLayer(featureGroupp);
      }
      if (featureGroupb) {
        map.removeLayer(featureGroupb);
      }
      if (featureGroupn) {
        map.removeLayer(featureGroupn);
      }
      Waiting.forEach((item) => {
        const lat = item.latitude;
        const lon = item.longitude;
        const status = item.status;
        const veh = item.vid;
        iconUrl = truckw;
        const wIcon = L.icon({
          iconUrl: iconUrl,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
          popupAnchor: [1, 1],
          // You can also customize other icon properties like shadowUrl, shadowSize, etc.
        });

        const markerw = L.marker([lat, lon], { icon: wIcon });
        markerw.bindPopup("Vehicle Name: " + veh);
        featureGroupw.addLayer(markerw);

        map.fitBounds(featureGroupw.getBounds());
      });
      featureGroupw.addTo(map);
    }

    PowerCutX.addEventListener("click", fetchPowerCutdata);

    function fetchPowerCutdata() {
      if (featureGroup) {
        map.removeLayer(featureGroup);
      }
      if (featureGroupw) {
        map.removeLayer(featureGroupw);
      }
      if (featureGroup1) {
        map.removeLayer(featureGroup1);
      }
      if (featureGroupi) {
        map.removeLayer(featureGroupi);
      }
      if (featureGroupin) {
        map.removeLayer(featureGroupin);
      }
      if (featureGroupp) {
        map.removeLayer(featureGroupp);
      }
      if (featureGroupb) {
        map.removeLayer(featureGroupb);
      }
      if (featureGroupn) {
        map.removeLayer(featureGroupn);
      }
      PowerCut.forEach((item) => {
        const lat = item.latitude;
        const lon = item.longitude;
        const veh = item.vid;
        iconUrl = truckP;
        const PIcon = L.icon({
          iconUrl: iconUrl,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
          popupAnchor: [1, 1],
          // You can also customize other icon properties like shadowUrl, shadowSize, etc.
        });

        const markerp = L.marker([lat, lon], { icon: PIcon });
        markerp.bindPopup("Vehicle Name: " + veh);
        featureGroupp.addLayer(markerp);

        map.fitBounds(featureGroupp.getBounds());
      });
      featureGroupp.addTo(map);
    }

    idleX.addEventListener("click", fetchidledata);

    function fetchidledata() {
      if (featureGroup) {
        map.removeLayer(featureGroup);
      }
      if (featureGroupw) {
        map.removeLayer(featureGroupw);
      }
      if (featureGroup1) {
        map.removeLayer(featureGroup1);
      }
      if (featureGroupi) {
        map.removeLayer(featureGroupi);
      }
      if (featureGroupin) {
        map.removeLayer(featureGroupin);
      }
      if (featureGroupp) {
        map.removeLayer(featureGroupp);
      }
      if (featureGroupb) {
        map.removeLayer(featureGroupb);
      }
      if (featureGroupn) {
        map.removeLayer(featureGroupn);
      }
      Idle.forEach((item) => {
        const lat = item.latitude;
        const lon = item.longitude;
        const veh = item.vid;
        iconUrl = trucki;
        const IIcon = L.icon({
          iconUrl: iconUrl,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
          popupAnchor: [1, 1],
          // You can also customize other icon properties like shadowUrl, shadowSize, etc.
        });

        const markeri = L.marker([lat, lon], { icon: IIcon });
        markeri.bindPopup("Vehicle Name: " + veh);
        featureGroupi.addLayer(markeri);

        map.fitBounds(featureGroupi.getBounds());
      });
      featureGroupi.addTo(map);
    }

    inactiveX.addEventListener("click", fetchinactivedata);

    function fetchinactivedata() {
      if (featureGroup) {
        map.removeLayer(featureGroup);
      }
      if (featureGroupw) {
        map.removeLayer(featureGroupw);
      }
      if (featureGroup1) {
        map.removeLayer(featureGroup1);
      }
      if (featureGroupi) {
        map.removeLayer(featureGroupi);
      }
      if (featureGroupin) {
        map.removeLayer(featureGroupin);
      }
      if (featureGroupp) {
        map.removeLayer(featureGroupp);
      }
      if (featureGroupb) {
        map.removeLayer(featureGroupb);
      }
      if (featureGroupn) {
        map.removeLayer(featureGroupn);
      }
      Inactive.forEach((item) => {
        const lat = item.latitude;
        const lon = item.longitude;
        const status = item.status;
        const veh = item.vid;
        iconUrl = truckin;
        const inIcon = L.icon({
          iconUrl: iconUrl,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
          popupAnchor: [1, 1],
          // You can also customize other icon properties like shadowUrl, shadowSize, etc.
        });

        const markerin = L.marker([lat, lon], { icon: inIcon });
        markerin.bindPopup("Vehicle Name: " + veh);
        featureGroupin.addLayer(markerin);

        map.fitBounds(featureGroupin.getBounds());
      });
      featureGroupin.addTo(map);
    }
    console.log("Coordinates handled:", data);
  }
};

const addLiveVehicle = (data) => {
  console.log("data", data);
  if (data) {
    lat = data.latitude;
    lon = data.longitude;
    veh = data.vehicleName;
    lst = data.LstRunIdletime;
    spd = data.speed;
    odo = data.TodaysODO;

    if (!markerl) {
      markerl = L.marker([lat, lon], { icon: trucklive }).addTo(map);
    }
    const newLat = data.latitude;
    const newLon = data.longitude;

    const prevLat = markerl.getLatLng().lat;
    const prevLon = markerl.getLatLng().lng;
    //   const newLat = data.latitude;
    //   const newLon = data.longitude;

    animateMarker(prevLat, prevLon, newLat, newLon);
    setMapView(newLat, newLon);
    const infoElement = document.querySelector(".information");

    var infoText =
      "Latitude: " +
      lat +
      " " +
      "Longitude: " +
      lon +
      " " +
      "Vehicle: " +
      veh +
      " " +
      "Speed: " +
      spd +
      " " +
      "run/Idle: " +
      lst +
      " " +
      "Odometer: " +
      odo;

    infoElement.innerHTML = infoText;
  }
};

const getGeofenceData = async () => {
  if (geofenceDropdown.value === "0") {
    Swal.fire({
      icon: "info",
      title: "Attention",
      text: "Please select geofence name",
    });
    return;
  }
  try {
    const { data } = await axios.get(geoJsonFile);

    showGeofence(data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const showGeofence = (gdata) => {
  var selectedValue = geofenceDropdown.value;
  if (filteredLayer) {
    map.removeLayer(filteredLayer);
  }
  filteredLayer = L.geoJSON(gdata, {
    filter: function (feature) {
      // Specify your filtering condition here
      // Example: Only show features with a certain property value
      // return feature.properties.geoName === ddlgeofence.value;
      return feature.properties.geoName === geofenceDropdown.value.trim();
    },

    onEachFeature: function (feature, layer) {
      // Bind a popup to the layer with the 'geoName' property value
      layer.bindPopup("Geofence Name: " + feature.properties.geoName, {
        className: "custom-popup-style",
      });
    },
  }).addTo(geofence);
  console.log(filteredLayer);

  var layerBounds = filteredLayer.getBounds();
  if (layerBounds.isValid()) {
    // Zoom to the bounds of the filtered layer
    map.fitBounds(layerBounds);
  } else {
    console.log("Invalid bounds. No features found or empty geometry.");
  }

  console.log(filteredLayer);
};

const getRouteId = async () => {
  try {
    const requestData = {
      storedProcedureName: "SP_Get_RouteId ",
      parameters: JSON.stringify({
        mode: 1,
        fk_VehicleId: historyVehicleDropdown.value,
      }),
    };

    const response = await axios.post(commonApi, requestData);

    if (!response.data.CommonMethodResult.CommonReportMasterList) {
      toast.show();
      return;
    }

    const commonReportMasterList =
      response.data.CommonMethodResult.CommonReportMasterList[0].ReturnValue;

    let data = JSON.parse(commonReportMasterList);
    console.log("sweeper route id", data);

    if (data) {
      clearMarkers();
      Show_Route_Polyline(data[0].RouteId);
      getFeeders(data[0].RouteId);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const getFeeders = async (RouteId) => {
  try {
    const requestData = {
      storedProcedureName: "proc_VehicleMapwithRoute_1 ",
      parameters: JSON.stringify({
        mode: 46,
        RouteId,
        FK_VehicleID: historyVehicleDropdown.value,
        // Startdate: startDate.value,
      }),
    };

    const response = await axios.post(commonApi, requestData);

    if (!response.data.CommonMethodResult.CommonReportMasterList) {
      toast.show();
      return;
    }

    const commonReportMasterList =
      response.data.CommonMethodResult.CommonReportMasterList[0].ReturnValue;

    let data = JSON.parse(commonReportMasterList);
    console.log("Feeder data", data);
    showFeeders(data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const showFeeders = (data) => {
  var markerfup;

  for (var i = 0; i < data.length; i++) {
    var lat = data[i].sLat;
    var lon = data[i].sLong;
    var Feeder = data[i].feedername;
    var expectedTime = data[i].expectedtime;
    var AttendTime = data[i].AttendTime;
    var WaitTime = data[i].WaitTime;
    var icon;
    if (AttendTime.startsWith("N")) {
      console.log("Status starts with 'N'");
      iconUrl1 = REDFEEDER;
    } else {
      iconUrl1 = BLUEFEEDER;
      console.log(iconUrl1);
    }

    const myfIcon = L.icon({
      iconUrl: iconUrl1,
      iconSize: [20, 20],
      iconAnchor: [0.5, 0.5],
      popupAnchor: [1, 1],
      // You can also customize other icon properties like shadowUrl, shadowSize, etc.
    });

    markerfup = L.marker([lat, lon], { icon: myfIcon }).addTo(myfIconLayer);
    markerfup.bindPopup(
      "Feeder Name: " +
        Feeder +
        "<br>AttendTime: " +
        AttendTime +
        "<br>WaitTime: " +
        WaitTime +
        "<br>Expected Time: " +
        expectedTime
    );
  }
};

// const showPolylineOnMap = (coordinates) => {
//   markerGroup1.clearLayers();
//   var decorator;
//   var polyline = L.polyline(coordinates, {
//     color: "red",
//     opacity: 0.5,
//   }).addTo(markerGroup1);
//   polyline.addTo(markerGroup1);

//   var bounds = polyline.getBounds();
//   map.flyToBounds(bounds, { duration: 1, easeLinearity: 0.25 });
//   decorator = L.polylineDecorator(polyline, {
//     patterns: [
//       {
//         offset: 0,
//         symbol: L.Symbol.marker({
//           markerOptions: {
//             icon: L.divIcon({ className: "start-route-icon" }),
//             zIndexOffset: 1000,
//           },
//         }),
//       },
//       {
//         offset: "10%",
//         repeat: 50,
//         symbol: L.Symbol.arrowHead({
//           pixelSize: 5,
//           polygon: true,
//           pathOptions: { stroke: true, color: "#414181" },
//         }),
//       },
//     ],
//   }).addTo(markerGroup1);

//   decorator.addTo(markerGroup1);

//   coordinates.forEach(function (coords, index) {
//     if (index === 0) {
//       L.marker(coords, {
//         icon: L.divIcon({ className: "custom-start-marker" }),
//       }).addTo(markerGroup1);
//     } else {
//       L.marker(coords, {
//         icon: L.divIcon({ className: "custom-marker" }),
//       }).addTo(markerGroup1);
//     }
//   });
// };

const showPolylineOnMap = (coordinates) => {
  markerGroup1.clearLayers();
  var decorator;

  // Create polyline
  var polyline = L.polyline(coordinates, {
    color: "red",
    opacity: 0.5,
  }).addTo(markerGroup1);

  // Add polyline to markerGroup1
  polyline.addTo(markerGroup1);

  // Get bounds and fly to them
  var bounds = polyline.getBounds();
  map.flyToBounds(bounds, { duration: 1, easeLinearity: 0.25 });

  // Add start marker (green dot)
  L.marker(coordinates[0], {
    icon: L.divIcon({ className: "custom-start-marker1" }),
  }).addTo(markerGroup1);

  // Add end marker (red dot)
  L.marker(coordinates[coordinates.length - 1], {
    icon: L.divIcon({ className: "custom-end-marker1" }),
  }).addTo(markerGroup1);

  // Add polyline decorator with arrow heads
  decorator = L.polylineDecorator(polyline, {
    patterns: [
      {
        offset: "10%",
        repeat: 50,
        symbol: L.Symbol.arrowHead({
          pixelSize: 5,
          polygon: true,
          pathOptions: { stroke: true, color: "#414181" },
        }),
      },
    ],
  }).addTo(markerGroup1);

  // Add polyline decorator to markerGroup1
  decorator.addTo(markerGroup1);

  // Add custom markers for each coordinate
  coordinates.slice(1, -1).forEach(function (coords) {
    L.marker(coords, {
      icon: L.divIcon({ className: "custom-marker" }),
    }).addTo(markerGroup1);
  });
};

// show Route_polyline
const Show_Route_Polyline = async (routeId) => {
  try {
    const sweeperRequestData = {
      storedProcedureName: "proc_VehicleMapwithRoute_1",
      parameters: JSON.stringify({
        Mode: 28,
        Fk_accid: 11401,
        Fk_ZoneId: zoneDropdown.value,
        FK_WardId: wardDropdown.value,
        Fk_divisionid: routeId,
      }),
    };

    console.log("route id", sweeperRequestData);
    const response = await axios.post(commonApi, sweeperRequestData);

    const commonReportMasterList =
      response.data.CommonMethodResult.CommonReportMasterList[0].ReturnValue;

    let data = JSON.parse(commonReportMasterList);
    // console.log("polyline Data", data);
    let coordinates = [];
    // console.log(dropdownData);
    for (const d of data) {
      let array = [];
      array.push(d.RouteLat);
      array.push(d.RouteLng);
      coordinates.push(array);
    }
    console.log(coordinates);
    showPolylineOnMap(coordinates);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const getHistoryVehicleData = async () => {
  try {
    const requestData = {
      storedProcedureName: "Proc_VehicleMap_1",
      parameters: JSON.stringify({
        mode: 4,
        UserID: 11401,
        zoneId: zoneDropdown.value,
        WardId: wardDropdown.value,
        FK_VehicleID: historyVehicleDropdown.value,
        sDate: `${startDate.value.split("T")[0]} ${
          startDate.value.split("T")[1]
        }`,
        eDate: `${endDate.value.split("T")[0]} ${endDate.value.split("T")[1]}`,
      }),
    };

    console.log(requestData);
    const response = await axios.post(commonApi, requestData);

    if (!response.data.CommonMethodResult.CommonReportMasterList) {
      toast.show();
      return;
    }

    const commonReportMasterList =
      response.data.CommonMethodResult.CommonReportMasterList[0].ReturnValue;

    let data = JSON.parse(commonReportMasterList);
    console.log(data);
    clearMarkers();
    addMarkersWithDelay(data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const addMarkersWithDelay = (data) => {
  var marker;
  var markerPosition = [];
  var startMarker;
  var endMarker;

  for (var i = 0; i < data.length; i++) {
    var lat = data[i].latitude;
    var lon = data[i].longitude;
    var time = `Date: ${data[i].datetim.split("T")[0]} <br> Time: ${
      data[i].datetim.split("T")[1]
    }`;

    marker1 = L.marker([lat, lon], { icon: dot }).addTo(dotMarkerLayer);
    marker1.bindPopup(time);

    if (i === 0) {
      // This is the start point
      startMarker = L.marker([lat, lon], { icon: greenflag }).addTo(map);
      startMarker.bindPopup(time);
    } else if (i === data.length - 1) {
      // This is the end point
      endMarker = L.marker([lat, lon], { icon: redflag }).addTo(map);
      endMarker.bindPopup(time);
    }

    var timeoutId = setTimeout(
      function (latitude, longitude) {
        if (marker) {
          // Smoothly update marker position
          var startTime = Date.now();
          var duration = 200; // Time in milliseconds for the animation
          var initialLatLng = marker.getLatLng();
          var targetLatLng = new L.LatLng(latitude, longitude);

          function step() {
            var currentTime = Date.now();
            var elapsedTime = currentTime - startTime;

            if (elapsedTime < duration) {
              var fraction = elapsedTime / duration;
              var interpolatedLatLng = L.latLng(
                initialLatLng.lat +
                  (targetLatLng.lat - initialLatLng.lat) * fraction,
                initialLatLng.lng +
                  (targetLatLng.lng - initialLatLng.lng) * fraction
              );

              marker.setLatLng(interpolatedLatLng);

              // Calculate and set rotation angle based on bearing
              var bearing = calculateBearing(
                initialLatLng.lat,
                initialLatLng.lng,
                targetLatLng.lat,
                targetLatLng.lng
              );
              marker.setRotationAngle(bearing); // Adjust this line according to your marker library

              map.panTo(interpolatedLatLng); // Pan the map to the interpolated position

              requestAnimationFrame(step);
            } else {
              marker.setLatLng(targetLatLng); // Ensure the final position is accurate
            }
          }

          step();
        } else {
          var newLatLng = new L.LatLng(latitude, longitude);
          marker = L.marker(newLatLng, { icon: truckIcon });
          marker.addTo(markerGroup);

          if (initialPan) {
            // Pan the map to newLatLng only on the initial marker
            map.panTo(newLatLng);
            initialPan = false; // Set the flag to false to prevent further automatic pans
          }

          console.log(
            "Your coordinate is: Lat: " + latitude + " Long: " + longitude
          );
        }
      },
      i * 200,
      lat,
      lon
    );

    timeoutIds.push(timeoutId); // Store the timeout ID in the array
  }
};

var initialPan = true;

function calculateBearing(lat1, lon1, lat2, lon2) {
  // Calculate the bearing (in degrees) between two points
  var y = Math.sin(lon2 - lon1) * Math.cos(lat2);
  var x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
  var bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360; // Ensure the bearing is between 0 and 360 degrees
}

// Group Tracking
btnGroupPlay.addEventListener("click", () => {
  if (!isFetching) {
    fetchInterval = setInterval(getGroupTrackData, 5000);
    btnGroupPlay.disabled = true;
    btnGroupStop.disabled = false;
    isFetching = true;
  }
});

btnGroupStop.addEventListener("click", () => {
  if (isFetching) {
    clearInterval(fetchInterval);
    isFetching = false;
    btnGroupPlay.disabled = false;
    btnGroupStop.disabled = true;
  }
});

// Live Tracking
btnLivePlay.addEventListener("click", async () => {
  if (liveVehicleDropdown.value === "0") {
    Swal.fire({
      icon: "info",
      title: "Attention",
      text: "Please select Vehicle Number",
    });
    return;
  }

  if (!isTracking) {
    trackInterval = setInterval(getLiveVehicleLocation, 5000);
    btnLivePlay.disabled = true;
    btnLiveStop.disabled = false;
    isTracking = true;
  }
});

btnLiveStop.addEventListener("click", () => {
  if (isTracking) {
    clearInterval(trackInterval);
    isTracking = false;
    btnLivePlay.disabled = false;
  }
});

// History
btnHistoryShow.addEventListener("click", async (e) => {
  e.preventDefault();

  if (historyVehicleDropdown.value === "0") {
    Swal.fire({
      icon: "info",
      title: "Attention",
      text: "Please select Zone, Ward, Startdate, Enddate and Vehicle name",
    });
    return;
  }

  clearMap();
  await getRouteId();
});

btnHistoryPlay.addEventListener("click", async (e) => {
  e.preventDefault();

  if (
    zoneDropdown.value === "0" ||
    wardDropdown.value === "0" ||
    !startDate.value ||
    !endDate.value ||
    historyVehicleDropdown.value === "0"
  ) {
    Swal.fire({
      icon: "info",
      title: "Attention",
      text: "Please select Zone, Ward, Startdate, enddate and vehicle name",
    });
    return;
  }

  if (isPlaying) {
    // Pause the animation
    isPlaying = false;
    btnHistoryPlay.innerHTML = `<i class="fa-regular fa-circle-play text-white"></i>Play`;
    btnHistoryPlay.classList.remove("btn-danger");
    btnHistoryPlay.classList.add("btn-success");
    timeoutIds.forEach(function (timeoutId) {
      clearTimeout(timeoutId); // Clear all timeouts to pause the animation
    });
  } else {
    // Resume or start the animation
    isPlaying = true;
    btnHistoryPlay.innerHTML = `<i class="fa-solid fa-stop text-white"></i>Stop`;
    btnHistoryPlay.classList.add("btn-danger");
    btnHistoryPlay.classList.remove("btn-success");
    markerGroup.clearLayers();
    await getHistoryVehicleData();
  }
});

// Clear

//Clear map

btnClearMap.addEventListener("click", () => {
  clearMap();
  if (filteredLayer) {
    map.removeLayer(filteredLayer);
  }
});

const clearMarkers = () => {
  markerGroup.clearLayers();
  timeoutIds.forEach(function (timeoutId) {
    clearTimeout(timeoutId); // Clear all timeouts
  });
  timeoutIds = []; // Clear the timeout IDs array
};

const clearMap = () => {
  clearAllMarkers();
  clearPolyline();
  clearMarkers();
};

const clearPolyline = () => {
  routeLayer.clearLayers();
};

const clearAllMarkers = () => {
  dotMarkerLayer.clearLayers();
  markerGroup.clearLayers();
};

window.addEventListener("load", async () => {
  await populateZoneDropdown();
  await populateVendorDropdown();
  await populateLiveVehicleDropdown();
  await populateHistoryVehiDropdown();
  await populateGeofenceDropdown();
});

// Bootstrap

const toast = new bootstrap.Toast(document.getElementById("noDataToast"));
