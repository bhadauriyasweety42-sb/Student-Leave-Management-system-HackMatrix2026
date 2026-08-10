// Checks if the user has the required role
// Validate college user roles
function "rbac/check_role" {
  input {
    int user_id
    text required_role
  }

  stack {
    // Roles: student, coordinator, hod
    db.get user {
      field_name = "id"
      field_value = $input.user_id
    } as $user
  
    precondition ($user != null) {
      error_type = "accessdenied"
      error = "User not found"
    }
  
    // Logic for student < coordinator < hod
    var $is_authorized {
      value = false
    }
  
    switch ($input.required_role) {
      case ("hod") {
        var.update $is_authorized {
          value = $user.role == "hod"
        }
      } break
    
      case ("coordinator") {
        var.update $is_authorized {
          value = ($user.role == "coordinator") || ($user.role == "hod")
        }
      } break
    
      case ("student") {
        var.update $is_authorized {
          value = true
        }
      } break
    }
  
    precondition ($is_authorized) {
      error_type = "accessdenied"
      error = "Insufficient permissions. Required role: " ~ $input.required_role
    }
  }

  response = true
  guid = "DEFiz8WjJZwogGFSA9UYQy1OUX8"
}