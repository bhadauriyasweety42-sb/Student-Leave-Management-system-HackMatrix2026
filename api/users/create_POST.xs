// Create a new user (HR/Admin)
query create verb=POST {
  api_group = "Users"
  auth = "user"

  input {
    text full_name
    email email filters=trim|lower
    password password
    text employee_id?
    int department_id?
    enum role {
      values = ["employee", "manager", "hr", "admin"]
    }
  
    text designation?
    text phone?
    date joining_date?
    bool is_active?=true
  }

  stack {
    // 1. RBAC
    function.run "rbac/check_role" {
      input = {user_id: $auth.id, required_role: "hr"}
    } as $role_check
  
    // 2. Check uniqueness
    db.get user {
      field_name = "email"
      field_value = $input.email
    } as $existing_email
  
    precondition ($existing_email == null) {
      error_type = "inputerror"
      error = "Email already exists"
    }
  
    conditional {
      if ($input.employee_id != null) {
        db.get user {
          field_name = "employee_id"
          field_value = $input.employee_id
        } as $existing_emp
      
        precondition ($existing_emp == null) {
          error_type = "inputerror"
          error = "Employee ID already exists"
        }
      }
    }
  
    // 3. Add user
    db.add user {
      data = {
        full_name    : $input.full_name
        email        : $input.email
        password     : $input.password
        employee_id  : $input.employee_id
        department_id: $input.department_id
        role         : $input.role
        designation  : $input.designation
        phone        : $input.phone
        joining_date : $input.joining_date
        is_active    : $input.is_active
        created_at   : now
      }
    } as $user
  
    // 4. Audit log
    db.add audit_log {
      data = {
        user_id    : $auth.id
        action     : "user_creation"
        entity_type: "user"
        entity_id  : $user.id
        description: "Created user: " ~ ($user.full_name|to_text)
        ip_address : $env.$remote_ip
        created_at : now
      }
    } as $audit
  }

  response = {success: true, message: "User created", data: $user}
  guid = "GGA0SopkszO7a1VsPgni4p5yFro"
}