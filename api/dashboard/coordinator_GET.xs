// Coordinator dashboard overview
// Get overview for coordinator dashboard
query coordinator verb=GET {
  api_group = "Dashboard"
  auth = "user"

  input {
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
  
    // 2. Student count in section
    db.query user {
      where = ($db.user.role == "student") && ($db.user.branch_id == $coordinator.branch_id) && ($db.user.section_id == $coordinator.section_id)
      return = {type: "count"}
    } as $total_students
  
    // 3. Request stats for the section
    db.query leave_request {
      join = {
        student: {
          table: "user"
          where: ($db.leave_request.student_id == $db.student.id) && ($db.student.branch_id == $coordinator.branch_id) && ($db.student.section_id == $coordinator.section_id)
        }
      }
    
      where = $db.leave_request.coordinator_status == "pending"
      return = {type: "count"}
    } as $pending_approvals
  
    db.query leave_request {
      join = {
        student: {
          table: "user"
          where: ($db.leave_request.student_id == $db.student.id) && ($db.student.branch_id == $coordinator.branch_id) && ($db.student.section_id == $coordinator.section_id)
        }
      }
    
      where = $db.leave_request.coordinator_status == "approved"
      return = {type: "count"}
    } as $approved_count
  
    db.query leave_request {
      join = {
        student: {
          table: "user"
          where: ($db.leave_request.student_id == $db.student.id) && ($db.student.branch_id == $coordinator.branch_id) && ($db.student.section_id == $coordinator.section_id)
        }
      }
    
      where = $db.leave_request.coordinator_status == "rejected"
      return = {type: "count"}
    } as $rejected_count
  
    // 4. Today's/Recent activity
    db.query leave_request {
      join = {
        student: {
          table: "user"
          where: ($db.leave_request.student_id == $db.student.id) && ($db.student.branch_id == $coordinator.branch_id) && ($db.student.section_id == $coordinator.section_id)
        }
      }
    
      sort = {created_at: "desc"}
      eval = {student_name: $db.student.name}
      return = {type: "list", paging: {page: 1, per_page: 5}}
    } as $recent_activity
  }

  response = {
    success: true
    data   : ```
      {
        stats: {
          total_students: $total_students,
          pending: $pending_approvals,
          approved: $approved_count,
          rejected: $rejected_count
        },
        recent_activity: $recent_activity
      }
      ```
  }

  guid = "qDz0pspgKAeSm2uVjSk5wODICjY"
}