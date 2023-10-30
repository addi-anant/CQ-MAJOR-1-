let month = document.getElementById("order-month").value;

/* Analytics Product Table: */
const populateProductTable = async () => {
  const response = await fetch(`/seller/product`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const dataSource = await response.json();

  $(document).ready(function () {
    $("#product-table").dataTable({
      data: dataSource,
      columns: [
        { data: "id" },
        { data: "name" },
        { data: "price" },
        { data: "stock" },
        { data: "active" },
        { data: "approved" },
        { data: "category" },
      ],
      paging: true,
    });
  });
};
populateProductTable();

/* Order Table (:month) */
const populateOrderTable = async () => {
  const response = await fetch(`/seller/order-recieved/${month}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const dataSource = await response.json();

  if ($.fn.dataTable.isDataTable("#order-table")) {
    $("#order-table").DataTable().destroy();
  }

  $(document).ready(function () {
    $("#order-table").dataTable({
      data: dataSource,
      columns: [
        { data: "id" },
        { data: "userID" },
        { data: "quantity" },
        { data: "price" },
        { data: "status" },
      ],
      paging: true,
    });
  });
};
populateOrderTable();

document.getElementById("order-month")?.addEventListener("change", function () {
  month = this?.value;
  populateOrderTable();
});

/* Total Sale Amount Per Month: */
const drawLineChart = async () => {
  const response = await fetch(`/seller/sale-per-month`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const { data } = await response.json();

  let info = [];
  for (let ind = 1; ind <= 12; ind++) info.push([ind, 0]);
  data.map((item) => (info[item?.month - 1] = [item?.month, item?.amount]));

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
google.charts.setOnLoadCallback(drawLineChart);
