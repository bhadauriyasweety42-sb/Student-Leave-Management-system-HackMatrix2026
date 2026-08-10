// List team leave requests for a manager
query team verb=GET {
  api_group = "LeaveRequests"
  auth = "user"

  input {
    int page?=1
    int per_page?=10
    text status?
  }

  stack {
    // 1. RBAC
    function.run "rbac/check_role" {
      input = {user_id: $auth.id, required_role: "manager"}
    }
  
    // 2. Get manager's departments
    db.query department {
      where = $db.department.manager_id == $auth.id
      return = {type: "list"}
    } as $managed_depts
  
    var $dept_ids {
      value = $managed_depts|map:$$.id
    }
  
    // 3. Query requests for users in those departments
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
    
      where = $db.leave_request.status ==? $input.status
      sort = {created_at: "desc"}
      eval = {
        user_name      : $db.user.full_name
        user_email     : $db.user.email
        leave_type_name: $db.leave_type.name
      }
    
      return = {
        type  : "list"
        paging: {
          page    : $input.page
          per_page: $input.per_page
          totals  : true
        }
      }
    } as $requests
  }

  response = {success: true, data: $requests}
  guid = "rM2h1CEbl18-Tdkg4SrlxOwoqEU"
}