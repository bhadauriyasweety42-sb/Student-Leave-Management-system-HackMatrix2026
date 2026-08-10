// HOD dashboard overview
// Get overview for HOD dashboard
query hod verb=GET {
  api_group = "Dashboard"
  auth = "user"

  input {
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
  
    // 3. Department stats - Pending at HOD
    // Use the reliable Inner Join pattern where security filters are inside the join condition
    db.query leave_request {
      join = {
        student: {
          table: "user"
          where: ($db.leave_request.student_id == $db.student.id) && ($db.student.department_id == $hod_dept_id)
        }
      }
    
      where = ($db.leave_request.coordinator_status == "approved") && ($db.leave_request.hod_status == "pending")
      return = {type: "count"}
    } as $pending_approvals
  
    // 4. Department stats - Approved by HOD
    db.query leave_request {
      join = {
        student: {
          table: "user"
          where: ($db.leave_request.student_id == $db.student.id) && ($db.student.department_id == $hod_dept_id)
        }
      }
    
      where = $db.leave_request.hod_status == "approved"
      return = {type: "count"}
    } as $approved_count
  
    // 5. Department stats - Rejected by HOD
    db.query leave_request {
      join = {
        student: {
          table: "user"
          where: ($db.leave_request.student_id == $db.student.id) && ($db.student.department_id == $hod_dept_id)
        }
      }
    
      where = $db.leave_request.hod_status == "rejected"
      return = {type: "count"}
    } as $rejected_count
  
    // 6. Branch-wise Overview
    db.query branch {
      where = $db.branch.department_id == $hod_dept_id
      return = {type: "list"}
    } as $branches
  
    var $branch_stats {
      value = []
    }
  
    foreach ($branches) {
      each as $br {
        db.query user {
          where = ($db.user.role == "student") && ($db.user.branch_id == $br.id)
          return = {type: "count"}
        } as $s_count
      
        var.update $branch_stats {
          value = $branch_stats
            |push:{ name: $br.name, student_count: $s_count }
        }
      }
    }
  }

  response = {
    success: true
    data   : ```
      {
        stats: {
          pending_at_hod: $pending_approvals,
          pending: $pending_approvals,
          pending_count: $pending_approvals,
          awaiting_approval: $pending_approvals,
          approved_by_hod: $approved_count,
          rejected_by_hod: $rejected_count
        },
        branch_overview: $branch_stats
      }
      ```
  }

  guid = "kiR9UAeSZLkpCxaM627O6EIRvck"
}