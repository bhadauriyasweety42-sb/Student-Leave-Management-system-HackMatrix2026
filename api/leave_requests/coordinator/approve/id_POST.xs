// Coordinator approves a student's leave application
// Coordinator reviews and approves leave application
query "coordinator/approve/{id}" verb=POST {
  api_group = "LeaveRequests"
  auth = "user"

  input {
    int id
    text coordinator_remark?
  }

  stack {
    // 1. RBAC
    function.run "rbac/check_role" {
      input = {user_id: $auth.id, required_role: "coordinator"}
    } as $role_check
  
    // 2. Get Request and validate scope
    db.get leave_request {
      field_name = "id"
      field_value = $input.id
    } as $request
  
    precondition ($request != null) {
      error_type = "notfound"
      error = "Application not found"
    }
  
    precondition ($request.coordinator_status == "pending") {
      error_type = "inputerror"
      error = "Application already reviewed"
    }
  
    db.get user {
      field_name = "id"
      field_value = $auth.id
    } as $coordinator
  
    db.get user {
      field_name = "id"
      field_value = $request.student_id
    } as $student
  
    precondition (($coordinator.branch_id == $student.branch_id) && ($coordinator.section_id == $student.section_id)) {
      error_type = "accessdenied"
      error = "You can only approve applications for your assigned section"
    }
  
    // 3. Update Request
    db.edit leave_request {
      field_name = "id"
      field_value = $input.id
      data = {
        coordinator_status: "approved"
        coordinator_remark: $input.coordinator_remark
        final_status      : "pending_hod"
        updated_at        : now
      }
    } as $updated_request
  
    // 4. Notify Student
    db.add notification {
      data = {
        user_id         : $student.id
        title           : "Coordinator Approved Your Leave"
        message         : "Your leave application has been approved by the Coordinator and forwarded to the HOD."
        type            : "leave_approved"
        related_leave_id: $request.id
        is_read         : false
        created_at      : now
      }
    } as $notif
  
    // 5. Audit Log
    db.add audit_log {
      data = {
        user_id    : $auth.id
        action     : "coordinator_approval"
        entity_type: "leave_request"
        entity_id  : $request.id
        description: "Coordinator approved application for student " ~ ($student.name|to_text)
        ip_address : $env.$remote_ip
        created_at : now
      }
    } as $audit
  }

  response = {
    success: true
    message: "Application approved and forwarded to HOD"
    data   : $updated_request
  }

  guid = "IyMBOn7KLzsWn2F_4bKHbVx9RGo"
}