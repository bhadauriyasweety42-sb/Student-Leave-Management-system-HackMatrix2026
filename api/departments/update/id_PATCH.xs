// Update a department (Admin)
query "update/{id}" verb=PATCH {
  api_group = "Departments"
  auth = "user"

  input {
    int id
    text? name
    text? description
    int? manager_id
    bool? is_active
  }

  stack {
    // 1. RBAC
    function.run "rbac/check_role" {
      input = {user_id: $auth.id, required_role: "admin"}
    } as $role_check
  
    // 2. Build updates
    var $updates {
      value = {updated_at: now}
    }
  
    conditional {
      if ($input.name != null) {
        var.update $updates {
          value = $updates|set:"name":$input.name
        }
      }
    }
  
    conditional {
      if ($input.description != null) {
        var.update $updates {
          value = $updates
            |set:"description":$input.description
        }
      }
    }
  
    conditional {
      if ($input.manager_id != null) {
        var.update $updates {
          value = $updates
            |set:"manager_id":$input.manager_id
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
  
    // 3. Patch
    db.patch department {
      field_name = "id"
      field_value = $input.id
      data = $updates
    } as $updated_dept
  }

  response = {
    success: true
    message: "Department updated"
    data   : $updated_dept
  }

  guid = "m5KSH6WGBOh7gX8omlyS7fR2d7o"
}