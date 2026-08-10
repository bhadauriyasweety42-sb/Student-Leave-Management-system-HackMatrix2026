// HOD views applications approved by coordinators in their department
// Get coordinator-approved pending applications for HOD's department
query "hod/pending" verb=GET {
  api_group = "LeaveRequests"
  auth = "user"

  input {
    int page?=1
    int per_page?=20
  }

  stack {
    // 1. RBAC Check
    function.run "rbac/check_role" {
      input = {user_id: $auth.id, required_role: "hod"}
    } as $role_check
  
    // 2. Load HOD details and department ID
    db.get user {
      field_name = "id"
      field_value = $auth.id
    } as $hod
  
    precondition ($hod.department_id != null) {
      error_type = "accessdenied"
      error = "HOD account is not assigned to a department."
    }
  
    // Ensure department ID is a scalar integer
    var $hod_dept_id {
      value = $hod.department_id|to_int
    }
  
    // 3. Query coordinator-approved requests in HOD's department
    // Use an Inner Join to filter by department correctly
    db.query leave_request {
      join = {
        student: {
          table: "user"
          where: ($db.leave_request.student_id == $db.student.id) && ($db.student.department_id == $hod_dept_id)
        }
        branch : {
          table: "branch"
          type : "left"
          where: $db.student.branch_id == $db.branch.id
        }
      }
    
      where = ($db.leave_request.coordinator_status == "approved") && ($db.leave_request.hod_status == "pending")
      sort = {created_at: "asc"}
      eval = {
        student_name: $db.student.name
        roll_number : $db.student.roll_number
        branch_name : $db.branch.name
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
  guid = "YtLUMCkbemI1ozArxDSXaa9fGmE"
}