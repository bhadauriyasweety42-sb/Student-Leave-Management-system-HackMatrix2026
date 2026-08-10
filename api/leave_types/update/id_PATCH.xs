// Update a leave type (Admin)
query "update/{id}" verb=PATCH {
  api_group = "LeaveTypes"
  auth = "user"

  input {
    int id
    text? name
    text? description
    int? total_days
    bool? is_paid
    bool? requires_document
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
      if ($input.total_days != null) {
        var.update $updates {
          value = $updates
            |set:"total_days":$input.total_days
        }
      }
    }
  
    conditional {
      if ($input.is_paid != null) {
        var.update $updates {
          value = $updates|set:"is_paid":$input.is_paid
        }
      }
    }
  
    conditional {
      if ($input.requires_document != null) {
        var.update $updates {
          value = $updates
            |set:"requires_document":$input.requires_document
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
    db.patch leave_type {
      field_name = "id"
      field_value = $input.id
      data = $updates
    } as $updated_type
  }

  response = {
    success: true
    message: "Leave type updated"
    data   : $updated_type
  }

  guid = "Zb60ywLRXaMmVg-wITwu-u6hCsI"
}