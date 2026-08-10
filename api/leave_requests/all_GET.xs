// List all leave requests (HR/Admin)
query all verb=GET {
  api_group = "LeaveRequests"
  auth = "user"

  input {
    int page?=1
    int per_page?=10
    text status?
    int department_id?
    int user_id?
    int leave_type_id?
  }

  stack {
    // 1. RBAC
    function.run "rbac/check_role" {
      input = {user_id: $auth.id, required_role: "hr"}
    }
  
    // 2. Query all requests
    db.query leave_request {
      join = {
        user      : {
          table: "user"
          type : "left"
          where: $db.leave_request.user_id == $db.user.id
        }
        leave_type: {
          table: "leave_type"
          type : "left"
          where: $db.leave_request.leave_type_id == $db.leave_type.id
        }
        department: {
          table: "department"
          type : "left"
          where: $db.user.department_id == $db.department.id
        }
      }
    
      where = ($db.leave_request.status ==? $input.status) && ($db.user.department_id ==? $input.department_id) && ($db.leave_request.user_id ==? $input.user_id) && ($db.leave_request.leave_type_id ==? $input.leave_type_id)
      sort = {created_at: "desc"}
      eval = {
        user_name      : $db.user.full_name
        department_name: $db.department.name
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
  guid = "EcmsMBisTUwva0gTCEP-rCy-MJ8"
}