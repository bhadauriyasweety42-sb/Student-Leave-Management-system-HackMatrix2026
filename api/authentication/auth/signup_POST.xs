// Signup and retrieve an authentication token (College Version)
query "auth/signup" verb=POST {
  api_group = "Authentication"

  input {
    text name
    email email filters=trim|lower
    password password
    enum role {
      values = ["student", "coordinator", "hod"]
    }
  
    // Optional in schema to avoid "missing param" errors, but validated in logic
    text? roll_number?
  
    int department_id
    int? branch_id?
    int? section_id?
  }

  stack {
    // 1. Check if a user record with that email exists
    db.get user {
      field_name = "email"
      field_value = $input.email
    } as $user_exists
  
    // Verify that the email being used to sign up is unique
    precondition ($user_exists == null) {
      error_type = "inputerror"
      error = "An account with this email already exists."
    }
  
    // 2. Normalize optional fields to handle empty string vs null
    // This prevents duplicate record errors on unique indexes for empty strings
    var $roll_number_clean {
      value = $input.roll_number
    }
  
    conditional {
      if ($roll_number_clean == "") {
        var.update $roll_number_clean {
          value = null
        }
      }
    }
  
    var $branch_id_clean {
      value = $input.branch_id
    }
  
    conditional {
      if ($branch_id_clean == 0) {
        var.update $branch_id_clean {
          value = null
        }
      }
    }
  
    var $section_id_clean {
      value = $input.section_id
    }
  
    conditional {
      if ($section_id_clean == 0) {
        var.update $section_id_clean {
          value = null
        }
      }
    }
  
    // 3. Validate role-specific requirements
    conditional {
      // Logic for Students
      if ($input.role == "student") {
        precondition ($roll_number_clean != null) {
          error_type = "inputerror"
          error = "Roll number is required for students."
        }
      
        precondition ($branch_id_clean != null) {
          error_type = "inputerror"
          error = "Branch selection is required for students."
        }
      
        precondition ($section_id_clean != null) {
          error_type = "inputerror"
          error = "Section selection is required for students."
        }
      
        // Check for duplicate roll number
        db.get user {
          field_name = "roll_number"
          field_value = $roll_number_clean
        } as $roll_exists
      
        precondition ($roll_exists == null) {
          error_type = "inputerror"
          error = "A student with this Roll Number already exists."
        }
      }
    
      // Logic for Coordinators
      elseif ($input.role == "coordinator") {
        precondition ($branch_id_clean != null) {
          error_type = "inputerror"
          error = "Branch selection is required for coordinators."
        }
      
        precondition ($section_id_clean != null) {
          error_type = "inputerror"
          error = "Section selection is required for coordinators."
        }
      }
    }
  
    // 4. Create a new user record
    db.add user {
      data = {
        created_at   : now
        name         : $input.name
        email        : $input.email
        password     : $input.password
        role         : $input.role
        roll_number  : $roll_number_clean
        department_id: $input.department_id
        branch_id    : $branch_id_clean
        section_id   : $section_id_clean
        is_active    : true
      }
    } as $user
  
    // 5. Create an authentication token
    security.create_auth_token {
      table = "user"
      extras = {}
      expiration = 86400
      id = $user.id
    } as $authToken
  
    // 6. Create an event log for signup (Audit)
    db.add audit_log {
      data = {
        user_id    : $user.id
        action     : "signup"
        entity_type: "user"
        entity_id  : $user.id
        description: "User registered as " ~ ($user.role|to_text)
        ip_address : $env.$remote_ip
        created_at : now
      }
    } as $audit
  }

  response = {
    success  : true
    authToken: $authToken
    user_id  : $user.id
    role     : $user.role
  }

  tags = ["xano:quick-start"]
  guid = "f1T-alVxN7A6k_I4c97SlCQ2Fvw"
}