// Update a user (HR/Admin)
query "update/{id}" verb=PATCH {
  api_group = "Users"
  auth = "user"

  input {
    int id
    text? full_name
    email? email filters=trim|lower
    text? employee_id
    int? department_id
    enum? role {
      values = ["employee", "manager", "hr", "admin"]
    }
  
    text? designation
    text? phone
    date? joining_date
    bool? is_active
  }

  stack {
    // 1. RBAC
    function.run "rbac/check_role" {
      input = {user_id: $auth.id, required_role: "hr"}
    } as $role_check
  
    // 2. Get user
    db.get user {
      field_name = "id"
      field_value = $input.id
    } as $user
  
    precondition ($user != null) {
      error_type = "notfound"
      error = "User not found"
    }
  
    // 3. Build updates
    var $updates {
      value = {updated_at: now}
    }
  
    conditional {
      if ($input.full_name != null) {
        var.update $updates {
          value = $updates|set:"full_name":$input.full_name
        }
      }
    }
  
    conditional {
      if ($input.email != null) {
        var.update $updates {
          value = $updates|set:"email":$input.email
        }
      }
    }
  
    conditional {
      if ($input.employee_id != null) {
        var.update $updates {
          value = $updates
            |set:"employee_id":$input.employee_id
        }
      }
    }
  
    conditional {
      if ($input.department_id != null) {
        var.update $updates {
          value = $updates
            |set:"department_id":$input.department_id
        }
      }
    }
  
    conditional {
      if ($input.role != null) {
        var.update $updates {
          value = $updates|set:"role":$input.role
        }
      }
    }
  
    conditional {
      if ($input.designation != null) {
        var.update $updates {
          value = $updates
            |set:"designation":$input.designation
        }
      }
    }
  
    conditional {
      if ($input.phone != null) {
        var.update $updates {
          value = $updates|set:"phone":$input.phone
        }
      }
    }
  
    conditional {
      if ($input.joining_date != null) {
        var.update $updates {
          value = $updates
            |set:"joining_date":$input.joining_date
        }
      }
    }
  
    conditional {
      if ($input.is_active != null) {
        var.update $updates {
          value = $updates|set:"is_active":$input.is_active
        }
      }
    }
  
    // 4. Patch
    db.patch user {
      field_name = "id"
      field_value = $input.id
      data = $updates
    } as $updated_user
  
    // 5. Audit log
    db.add audit_log {
      data = {
        user_id    : $auth.id
        action     : "user_update"
        entity_type: "user"
        entity_id  : $updated_user.id
        description: "Updated user: " ~ ($updated_user.full_name|to_text)
        ip_address : $env.$remote_ip
        created_at : now
      }
    } as $audit
  }

  response = {
    success: true
    message: "User updated"
    data   : $updated_user
  }

  guid = "srHK2rJoZq5TpeLsQJe5xQUeRbs"
}