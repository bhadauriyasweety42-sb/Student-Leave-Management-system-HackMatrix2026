// Reject a leave request
// Reject a pending leave request
query "reject/{id}" verb=POST {
  api_group = "LeaveRequests"
  auth = "user"

  input {
    int id
    text rejection_reason
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
      error = "Only pending requests can be rejected"
    }
  
    // 2. RBAC
    function.run "rbac/check_role" {
      input = {user_id: $auth.id, required_role: "manager"}
    }
  
    // 3. Manager team check
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
        db.get department {
          field_name = "id"
          field_value = $requester.department_id
        } as $dept
      
        precondition (($dept != null) && ($dept.manager_id == $auth.id)) {
          error_type = "accessdenied"
          error = "You are not authorized to reject leave for this employee"
        }
      }
    }
  
    // 4. Update request status
    db.edit leave_request {
      field_name = "id"
      field_value = $input.id
      data = {
        status          : "rejected"
        rejection_reason: $input.rejection_reason
        rejected_at     : now
        updated_at      : now
      }
    } as $updated_request
  
    // 5. Update leave balance (pending_days decrease, remaining_days increase back)
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
            pending_days  : $balance.pending_days - $request.number_of_days
            remaining_days: $balance.remaining_days + $request.number_of_days
            updated_at    : now
          }
        }
      }
    }
  
    // 6. Create notification
    db.add notification {
      data = {
        user_id         : $request.user_id
        title           : "Leave Request Rejected"
        message         : "Your leave request for " ~ ($request.number_of_days|to_text) ~ " days has been rejected."
        type            : "leave_rejected"
        related_leave_id: $request.id
        is_read         : false
        created_at      : now
      }
    } as $notif
  
    // 7. Audit log
    db.add audit_log {
      data = {
        user_id    : $auth.id
        action     : "leave_rejection"
        entity_type: "leave_request"
        entity_id  : $request.id
        description: "Rejected leave request for user " ~ ($request.user_id|to_text)
        ip_address : $env.$remote_ip
        created_at : now
      }
    } as $audit
  }

  response = {
    success: true
    message: "Leave request rejected"
    data   : $updated_request
  }

  guid = "TfWu-OtkiMKFB7N_TmbiF-bq9Cc"
}