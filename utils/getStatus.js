module.exports.getStatus = (status) => {
  switch (status) {
    case 0:
      return "Cancelled.";
    case 1:
      return "Preparing Placed Successfully.";
    case 2:
      return "Order Dispatched for warehouse 1.";
    case 3:
      return "Order Recieved at warehouse 1.";
    case 4:
      return "Order Dispatched for warehouse 2.";
    case 5:
      return "Order Recieved at warehouse 2.";
    case 6:
      return "Order Dispatched for final delivery station.";
    case 7:
      return "Order Recieved at final delivery station.";
    case 8:
      return "Order Out for Delivery.";
    case 9:
      return "Order successfully Delivered.";
  }
};
