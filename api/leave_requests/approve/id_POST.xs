// Approve a leave request
// Approve a pending leave request
query "approve/{id}" verb=POST {
  api_group = "LeaveRequests"
  auth = "user"

  input {
    int id
    text manager_comment?
  }

  stack {
    // 1. Get request
    db.get leave_request {
      field_name = "id"
      field_value = $input.id
    } as $request
  
    precondition ($request != null) {
      error_type = "notfound"
      error = "Leave request not found"
    }
  
    precondition ($request.status == "pending") {
      error_type = "inputerror"
      error = "Only pending requests can be approved"
    }
  
    // 2. RBAC (Manager/HR/Admin)
    function.run "rbac/check_role" {
      input = {user_id: $auth.id, required_role: "manager"}
    }
  
    // 3. Manager team check (If role is manager, check if user is in team)
    db.get user {
      field_name = "id"
      field_value = $auth.id
    } as $approver
  
    db.get user {
      field_name = "id"
      field_value = $request.user_id
    } as $requester
  
    conditional {
      if ($approver.role == "manager") {
        // Manager must be the manager of the requester's department
        db.get department {
          field_name = "id"
          field_value = $requester.department_id
        } as $dept
      
        precondition (($dept != null) && ($dept.manager_id == $auth.id)) {
          error_type = "accessdenied"
          error = "You are not authorized to approve leave for this employee"
        }
      }
    }
  
    // 4. Update request status
    db.edit leave_request {
      field_name = "id"
      field_value = $input.id
      data = {
        status         : "approved"
        manager_comment: $input.manager_comment
        approved_by    : $auth.id
        approved_at    : now
        updated_at     : now
      }
    } as $updated_request
  
    // 5. Update leave balance (pending_days decrease, used_days increase)
    db.query leave_balance {
      where = ($db.leave_balance.user_id == $request.user_id) && ($db.leave_balance.leave_type_id == $request.leave_type_id)
      return = {type: "single"}
    } as $balance
  
    conditional {
      if ($balance != null) {
        db.edit leave_balance {
          field_name = "id"
          field_value = $balance.id
          data = {
            pending_days: $balance.pending_days - $request.number_of_days
            used_days   : $balance.used_days + $request.number_of_days
            updated_at  : now
          }
        }
      }
    }
  
    // 6. Create notification for requester
    db.add notification {
      data = {
        user_id         : $request.user_id
        title           : "Leave Request Approved"
        message         : "Your leave request for " ~ ($request.number_of_days|to_text) ~ " days has been approved."
        type            : "leave_approved"
        related_leave_id: $request.id
        is_read         : false
        created_at      : now
      }
    } as $notif
  
    // 7. Audit log
    db.add audit_log {
      data = {
        user_id    : $auth.id
        action     : "leave_approval"
        entity_type: "leave_request"
        entity_id  : $request.id
        description: "Approved leave request for user " ~ ($request.user_id|to_text)
        ip_address : $env.$remote_ip
        created_at : now
      }
    } as $audit
  }

  response = {
    success: true
    message: "Leave request approved"
    data   : $updated_request
  }

  guid = "jI5PHAl65Q47SH3vmqPjhKAGz3Q"
}