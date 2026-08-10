// Get manager dashboard data
query manager verb=GET {
  api_group = "Dashboard"
  auth = "user"

  input {
  }

  stack {
    // 1. RBAC
    function.run "rbac/check_role" {
      input = {user_id: $auth.id, required_role: "manager"}
    }
  
    // 2. Get managed departments
    db.query department {
      where = $db.department.manager_id == $auth.id
      return = {type: "list"}
    } as $managed_depts
  
    var $dept_ids {
      value = $managed_depts|map:$$.id
    }
  
    // 3. Team members count
    db.query user {
      where = $db.user.department_id in $dept_ids
      return = {type: "count"}
    } as $team_count
  
    // 4. Pending approvals
    db.query leave_request {
      join = {
        user: {
          table: "user"
          where: ($db.leave_request.user_id == $db.user.id) && ($db.user.department_id in $dept_ids)
        }
      }
    
      where = $db.leave_request.status == "pending"
      return = {type: "count"}
    } as $pending_approvals
  
    // 5. Today's absent (on leave)
    db.query leave_request {
      join = {
        user: {
          table: "user"
          where: ($db.leave_request.user_id == $db.user.id) && ($db.user.department_id in $dept_ids)
        }
      }
    
      where = ($db.leave_request.status == "approved") && ($db.leave_request.start_date <= now) && ($db.leave_request.end_date >= now)
      return = {type: "list"}
    } as $on_leave_today
  
    // 6. Upcoming team leaves
    db.query leave_request {
      join = {
        user      : {
          table: "user"
          where: ($db.leave_request.user_id == $db.user.id) && ($db.user.department_id in $dept_ids)
        }
        leave_type: {
          table: "leave_type"
          type : "left"
          where: $db.leave_request.leave_type_id == $db.leave_type.id
        }
      }
    
      where = ($db.leave_request.status == "approved") && ($db.leave_request.start_date > now)
      sort = {start_date: "asc"}
      eval = {
        user_name      : $db.user.full_name
        leave_type_name: $db.leave_type.name
      }
    
      return = {type: "list", paging: {page: 1, per_page: 5}}
    } as $upcoming_leaves
  }

  response = {
    success: true
    data   : ```
      {
        team_count: $team_count,
        pending_approvals: $pending_approvals,
        on_leave_today: $on_leave_today,
        upcoming_leaves: $upcoming_leaves
      }
      ```
  }

  guid = "UYyphi8eVhINjx_KDvHIsb9jA5w"
}