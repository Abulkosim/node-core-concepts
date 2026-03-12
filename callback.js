function fetchUser(id) {
  return db.users.findById(id);
}

function fetchOrders(userId) {
  return db.orders.findByUserId(userId);
}

function fetchUserSummary(id) {
  return fetchUser(id)
    .then(user => {
      if (!user) {
        throw new Error("User not found");
      }

      return fetchOrders(user.id).then(orders => ({
        user,
        orders,
        orderCount: orders.length,
      }));
    });
}