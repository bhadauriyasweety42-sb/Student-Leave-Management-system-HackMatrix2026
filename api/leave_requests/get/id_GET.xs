// Get details of a specific leave application
// Get detailed information about a leave application
query "get/{id}" verb=GET {
  api_group = "LeaveRequests"
  auth = "user"

  input {
    int id
  }

  stack {
    db.get leave_request {
      field_name = "id"
      field_value = $input.id
    } as $request
  
    precondition ($request != null) {
      error_type = "notfound"
      error = "Leave application not found"
    }
  
    // Enforcement
    db.get user {
      field_name = "id"
      field_value = $auth.id
    } as $auth_user
  
    db.get user {
      field_name = "id"
      field_value = $request.student_id
    } as $student
  
    var $is_authorized {
      value = false
    }
  
    conditional {
      if ($auth_user.id == $request.student_id) {
        var.update $is_authorized {
          value = true
        }
      }
    
      elseif (($auth_user.role == "coordinator") && ($auth_user.branch_id == $student.branch_id) && ($auth_user.section_id == $student.section_id)) {
        var.update $is_authorized {
          value = true
        }
      }
    
      elseif (($auth_user.role == "hod") && ($auth_user.department_id == $student.department_id)) {
        var.update $is_authorized {
          value = true
        }
      }
    }
  
    precondition ($is_authorized) {
      error_type = "accessdenied"
      error = "You are not authorized to view this application"
    }
  }

  response = {
    success: true
    data   : ```
      {
        application: $request,
        student: $student
      }
      ```
  }

  guid = "N-9LgdMYX77ECJfI9N064LPt_ow"
}