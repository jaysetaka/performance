import { getTTFB, getLCP, getFID, getFCP, getCLS } from "web-vitals";
import { InfluxDB, Point } from "@influxdata/influxdb-client-browser";

const token =
  "WwSYbglqVjrU-wKPuK7sT4UCubN73JJH-QY4t5igbqMK_W_Alttjzs2_jwjqk3SpimYQcrRQz14-fGMX8Y46SA==";
const org = "developersswaartsolutions@gmail.com";
const bucket = "PerformanceData";

const client = token
  ? new InfluxDB({
      url: "https://eu-central-1-1.aws.cloud2.influxdata.com",
      token: token,
    })
  : null;

const infoDiv = document.createElement("div");
infoDiv.style.position = "fixed";
infoDiv.style.right = 0;
infoDiv.style.top = 0;
infoDiv.style.zIndex = 0;
infoDiv.style.backgroundColor = "black";
infoDiv.style.color = "white";
infoDiv.style.padding = "1rem";
infoDiv.style.fontFamily = "Arial";
document.body.appendChild(infoDiv);

const metrics = {};
const gatherMetrics = ({ name, value }) => {
  metrics[name] = value;

  if (client) {
    const writeApi = client.getWriteApi(org, bucket);
    writeApi.useDefaultTags({ host: "host1" });

    const point = new Point("perf").floatField(name, value);
    writeApi.writePoint(point);
    writeApi.close();
  }

  chrome.runtime.sendMessage({
    type: "performance:metric",
    name,
    value,
  });

  const metricsHTML = Object.keys(metrics)
    .map((k) => `<div>${k}</div><div>${Math.round(metrics[k])}</div>`)
    .join("");

  infoDiv.innerHTML = `
<div style="font-weight:bold;font-size:x-large">Perfomance Metrics</div>
<div style="display:grid; grid-template-columns: 1fr 1fr; grid-column-gap: 1rem;">
  <div>Metric</div>
  <div>Value</div>
  ${metricsHTML}
</div>
  `;
};

getTTFB(gatherMetrics);
getLCP(gatherMetrics);
getFID(gatherMetrics);
getFCP(gatherMetrics);
getCLS(gatherMetrics);
