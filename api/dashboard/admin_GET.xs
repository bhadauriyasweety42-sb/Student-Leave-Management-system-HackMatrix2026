// Get admin dashboard data
query admin verb=GET {
  api_group = "Dashboard"
  auth = "user"

  input {
  }

  stack {
    // 1. RBAC
    function.run "rbac/check_role" {
      input = {user_id: $auth.id, required_role: "hr"}
    }
  
    // 2. Employee stats
    db.query user {
      return = {type: "count"}
    } as $total_employees
  
    db.query user {
      where = $db.user.is_active == true
      return = {type: "count"}
    } as $active_employees
  
    db.query department {
      return = {type: "count"}
    } as $total_departments
  
    // 3. Leave stats
    db.query leave_request {
      where = $db.leave_request.status == "pending"
      return = {type: "count"}
    } as $pending_requests
  
    db.query leave_request {
      where = ($db.leave_request.status == "approved") && ($db.leave_request.start_date <= now) && ($db.leave_request.end_date >= now)
      return = {type: "count"}
    } as $on_leave_count
  }

  response = {
    success: true
    data   : ```
      {
        employees: {
          total: $total_employees,
          active: $active_employees
        },
        departments: {
          total: $total_departments
        },
        leaves: {
          pending: $pending_requests,
          currently_on_leave: $on_leave_count
        }
      }
      ```
  }

  guid = "d4Ewp4Fo-wvoKtmG0ic2gLEobXI"
}