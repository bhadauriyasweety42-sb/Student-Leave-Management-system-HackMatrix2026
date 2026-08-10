// Login and retrieve an authentication token
// Login to the College Leave Management System
query login verb=POST {
  api_group = "Auth"

  input {
    email email filters=trim|lower
    text password
  }

  stack {
    db.get user {
      field_name = "email"
      field_value = $input.email
    } as $user
  
    // Check to make sure a user with that email exists
    precondition ($user != null) {
      error_type = "accessdenied"
      error = "Invalid Credentials."
    }
  
    precondition ($user.is_active) {
      error_type = "accessdenied"
      error = "Your account is deactivated."
    }
  
    // Verify password using native Xano security
    security.check_password {
      text_password = $input.password
      hash_password = $user.password
    } as $pass_result
  
    precondition ($pass_result) {
      error_type = "accessdenied"
      error = "Invalid Credentials."
    }
  
    // Create authentication token
    security.create_auth_token {
      table = "user"
      extras = {}
      expiration = 86400
      id = $user.id
    } as $authToken
  
    // Fetch related context information
    db.get department {
      field_name = "id"
      field_value = $user.department_id
    } as $dept_rec
  
    db.get branch {
      field_name = "id"
      field_value = $user.branch_id
    } as $branch_rec
  
    db.get section {
      field_name = "id"
      field_value = $user.section_id
    } as $section_rec
  
    // Audit log
    db.add audit_log {
      data = {
        user_id    : $user.id
        action     : "login"
        entity_type: "user"
        entity_id  : $user.id
        description: "User logged in"
        ip_address : $env.$remote_ip
        created_at : now
      }
    } as $audit
  }

  response = {
    success: true
    message: "Login successful"
    data   : ```
      {
        authToken: $authToken,
        user: {
          id: $user.id,
          name: $user.name,
          email: $user.email,
          role: $user.role,
          roll_number: $user.roll_number,
          department: $dept_rec,
          branch: $branch_rec,
          section: $section_rec,
          profile_image: $user.profile_image
        }
      }
      ```
  }

  guid = "yY7uz65xgE6_tuExsoRRRm3QxMw"
}