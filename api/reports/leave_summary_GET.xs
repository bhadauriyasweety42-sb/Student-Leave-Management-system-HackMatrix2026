// College-wide or Department-wide leave report
query "leave-summary" verb=GET {
  api_group = "Reports"
  auth = "user"

  input {
    date? from_date
    date? to_date
    int? department_id
    int? branch_id
    int? section_id
    text? status
  }

  stack {
    // 1. RBAC
    function.run "rbac/check_role" {
      input = {user_id: $auth.id, required_role: "coordinator"}
    } as $role_check
  
    db.get user {
      field_name = "id"
      field_value = $auth.id
    } as $auth_user
  
    // 2. Build filtered query
    db.query leave_request {
      join = {
        student   : {
          table: "user"
          where: $db.leave_request.student_id == $db.student.id
        }
        department: {
          table: "department"
          type : "left"
          where: $db.student.department_id == $db.department.id
        }
        branch    : {
          table: "branch"
          type : "left"
          where: $db.student.branch_id == $db.branch.id
        }
      }
    
      where = ($db.leave_request.final_status ==? $input.status) && ($db.leave_request.from_date >=? $input.from_date) && ($db.leave_request.to_date <=? $input.to_date) && ($db.student.department_id ==? $input.department_id) && ($db.student.branch_id ==? $input.branch_id) && ($db.student.section_id ==? $input.section_id) && (($auth_user.role == "hod" && $db.student.department_id == $auth_user.department_id) || ($auth_user.role == "coordinator" && $db.student.branch_id == $auth_user.branch_id && $db.student.section_id == $auth_user.section_id))
      eval = {
        student_name: $db.student.name
        roll_number : $db.student.roll_number
        dept_name   : $db.department.name
        branch_name : $db.branch.name
      }
    
      return = {type: "list"}
    } as $report
  }

  response = {success: true, data: $report}
  guid = "VgbC3s-PJ9QjxoBclAKO9XEl540"
}