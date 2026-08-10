// Coordinator views pending applications from their section
// Get pending leave applications for assigned branch and section
query "coordinator/pending" verb=GET {
  api_group = "LeaveRequests"
  auth = "user"

  input {
    int page?=1
    int per_page?=20
  }

  stack {
    // 1. RBAC
    function.run "rbac/check_role" {
      input = {user_id: $auth.id, required_role: "coordinator"}
    } as $role_check
  
    db.get user {
      field_name = "id"
      field_value = $auth.id
    } as $coordinator
  
    // 2. Query students in the same branch and section
    db.query leave_request {
      join = {
        student: {
          table: "user"
          where: ($db.leave_request.student_id == $db.student.id) && ($db.student.branch_id == $coordinator.branch_id) && ($db.student.section_id == $coordinator.section_id)
        }
      }
    
      where = $db.leave_request.coordinator_status == "pending"
      sort = {created_at: "asc"}
      eval = {
        student_name: $db.student.name
        roll_number : $db.student.roll_number
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
  guid = "VbL8Lx5DeriwtaHjslk0eYq3aFs"
}