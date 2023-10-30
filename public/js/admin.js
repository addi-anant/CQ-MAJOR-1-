/* Total Product For Each Category: */
const drawPieChart1 = async () => {
  const response = await fetch(`/admin/graph/total-product-category`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const { data } = await response.json();
  const info = data.map((item) => [item.category, item.count]);

  const graphData = google.visualization.arrayToDataTable([
    ["Product", "Count"],
    ...info,
  ]);

  const options = {
    title: "Total Product For Each Category.",
  };

  const chart = new google.visualization.PieChart(
    document.getElementById("pieChart-1")
  );

  chart.draw(graphData, options);
};

/* Total Product Sold For Each Category: */
const drawPieChart2 = async () => {
  const response = await fetch(`/admin/graph/total-product-sold-category`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const { data } = await response.json();
  const info = data.map((item) => [item.category, item.count]);

  const graphData = google.visualization.arrayToDataTable([
    ["Product", "Count"],
    ...info,
  ]);

  const options = {
    title: "Total Product For Sold Each Category.",
  };

  const chart = new google.visualization.PieChart(
    document.getElementById("pieChart-2")
  );

  chart.draw(graphData, options);
};

/* Total Sale Amount Per Month: */
const drawLineChart = async () => {
  const response = await fetch(`/admin/graph/total-sale-amount`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const { data } = await response.json();
  let info = [];
  for (let ind = 1; ind <= 12; ind++) info.push([ind, 0]);
  data.map((item) => (info[item?.month - 1] = [item?.month, item?.amount]));

  console.log(info);

  const graphData = google.visualization.arrayToDataTable([
    ["Price", "Size"],
    ...info,
  ]);

  const options = {
    title: "Total Sale Per Month.",
    hAxis: { title: "Month" },
    vAxis: { title: "Sale" },
    legend: "none",
  };

  const chart = new google.visualization.LineChart(
    document.getElementById("lineChart")
  );

  chart.draw(graphData, options);
};

google.charts.load("current", { packages: ["corechart"] });
google.charts.setOnLoadCallback(drawPieChart1);
google.charts.setOnLoadCallback(drawPieChart2);
google.charts.setOnLoadCallback(drawLineChart);

document.querySelectorAll(".approve").forEach((approveBtn) => {
  approveBtn.addEventListener("click", async () => {
    const productID =
      approveBtn?.parentNode?.parentNode.getAttribute("product_id");

    const response = await fetch(`/admin/${productID}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const product = approveBtn?.parentNode?.parentNode;
    const cardContainer = approveBtn?.parentNode?.parentNode.parentNode;
    response.status === 200 && cardContainer.removeChild(product);
  });
});
