// Get employee dashboard data
query employee verb=GET {
  api_group = "Dashboard"
  auth = "user"

  input {
  }

  stack {
    // 1. Get user
    db.get user {
      field_name = "id"
      field_value = $auth.id
    } as $user
  
    // 2. Get balances
    db.query leave_balance {
      join = {
        leave_type: {
          table: "leave_type"
          type : "left"
          where: $db.leave_balance.leave_type_id == $db.leave_type.id
        }
      }
    
      where = $db.leave_balance.user_id == $auth.id
      eval = {leave_type_name: $db.leave_type.name}
      return = {type: "list"}
    } as $balances
  
    // 3. Calculate statistics
    var $stats {
      value = {
        total_leave    : ($balances|reduce:($$.total_allocated + $result):0)
        used_leave     : ($balances|reduce:($$.used_days + $result):0)
        pending_leave  : ($balances|reduce:($$.pending_days + $result):0)
        remaining_leave: ($balances|reduce:($$.remaining_days + $result):0)
      }
    }
  
    // 4. Recent requests
    db.query leave_request {
      join = {
        leave_type: {
          table: "leave_type"
          type : "left"
          where: $db.leave_request.leave_type_id == $db.leave_type.id
        }
      }
    
      where = $db.leave_request.user_id == $auth.id
      sort = {created_at: "desc"}
      eval = {leave_type_name: $db.leave_type.name}
      return = {type: "list", paging: {page: 1, per_page: 5}}
    } as $recent_requests
  
    // 5. Recent notifications
    db.query notification {
      where = ($db.notification.user_id == $auth.id) && ($db.notification.is_read == false)
      sort = {created_at: "desc"}
      return = {type: "list", paging: {page: 1, per_page: 10}}
    } as $notifications
  }

  response = {
    success: true
    data   : ```
      {
        user: $user,
        leave_balances: $balances,
        statistics: $stats,
        recent_requests: $recent_requests,
        notifications: $notifications
      }
      ```
  }

  guid = "yJaXRJQl81H2iE1pGRKDwJa7Gtk"
}