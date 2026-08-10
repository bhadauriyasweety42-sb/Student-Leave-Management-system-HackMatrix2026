// Update a leave balance manually (Admin)
query "update/{id}" verb=PATCH {
  api_group = "LeaveBalances"
  auth = "user"

  input {
    int id
    decimal? total_allocated
    decimal? used_days
    decimal? pending_days
    decimal? remaining_days
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
      if ($input.total_allocated != null) {
        var.update $updates {
          value = $updates
            |set:"total_allocated":$input.total_allocated
        }
      }
    }
  
    conditional {
      if ($input.used_days != null) {
        var.update $updates {
          value = $updates|set:"used_days":$input.used_days
        }
      }
    }
  
    conditional {
      if ($input.pending_days != null) {
        var.update $updates {
          value = $updates
            |set:"pending_days":$input.pending_days
        }
      }
    }
  
    conditional {
      if ($input.remaining_days != null) {
        var.update $updates {
          value = $updates
            |set:"remaining_days":$input.remaining_days
        }
      }
    }
  
    // 3. Patch
    db.patch leave_balance {
      field_name = "id"
      field_value = $input.id
      data = $updates
    } as $updated_balance
  }

  response = {
    success: true
    message: "Leave balance updated"
    data   : $updated_balance
  }

  guid = "5rxCls8ain6RQe7rw7B6PC_nmY4"
}