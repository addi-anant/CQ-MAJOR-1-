let category = document.getElementById("product-category").value;

const populateCategoryTable = async () => {
  const response = await fetch(`/admin/table/product-info/${category}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const dataSource = await response.json();

  if ($.fn.dataTable.isDataTable("#product-table")) {
    $("#product-table").DataTable().destroy();
  }

  $(document).ready(function () {
    $("#product-table").dataTable({
      data: dataSource,
      columns: [
        { data: "id" },
        { data: "name" },
        { data: "price" },
        { data: "stock" },
        { data: "sellerID" },
        { data: "active" },
        { data: "approved" },
        { data: "category" },
      ],
      paging: true,
    });
  });
};
populateCategoryTable();

document
  .getElementById("product-category")
  ?.addEventListener("change", function () {
    category = this?.value;
    populateCategoryTable();
  });
