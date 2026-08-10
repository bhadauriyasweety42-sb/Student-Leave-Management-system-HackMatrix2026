// Register a new college user
// Register a new student, coordinator, or HOD
query signup verb=POST {
  api_group = "Auth"

  input {
    text name
    email email filters=trim|lower
    password password
    enum role {
      values = ["student", "coordinator", "hod"]
    }
  
    text? roll_number
    int department_id
    int? branch_id
    int? section_id
    file? profile_image
  }

  stack {
    // 1. Check uniqueness
    db.get user {
      field_name = "email"
      field_value = $input.email
    } as $existing_email
  
    precondition ($existing_email == null) {
      error_type = "inputerror"
      error = "An account with this email already exists."
    }
  
    conditional {
      if (($input.role == "student") && ($input.roll_number != null)) {
        db.get user {
          field_name = "roll_number"
          field_value = $input.roll_number
        } as $existing_roll
      
        precondition ($existing_roll == null) {
          error_type = "inputerror"
          error = "A student with this Roll Number already exists."
        }
      }
    }
  
    // 2. Validate assignments
    conditional {
      if (($input.role == "student") || ($input.role == "coordinator")) {
        precondition ($input.branch_id != null) {
          error_type = "inputerror"
          error = "Branch is required for " ~ ($input.role|to_text)
        }
      
        precondition ($input.section_id != null) {
          error_type = "inputerror"
          error = "Section is required for " ~ ($input.role|to_text)
        }
      }
    }
  
    // 3. Handle image
    var $image_meta {
      value = null
    }
  
    conditional {
      if ($input.profile_image != null) {
        storage.create_attachment {
          value = $input.profile_image
          access = "public"
          filename = $input.profile_image.name
        } as $image_meta
      }
    }
  
    // 4. Add User
    db.add user {
      data = {
        name         : $input.name
        email        : $input.email
        password     : $input.password
        role         : $input.role
        roll_number  : $input.roll_number
        department_id: $input.department_id
        branch_id    : $input.branch_id
        section_id   : $input.section_id
        profile_image: $image_meta
        is_active    : true
        created_at   : now
      }
    } as $user
  
    // 5. Create token
    security.create_auth_token {
      table = "user"
      extras = {}
      expiration = 86400
      id = $user.id
    } as $authToken
  
    // 6. Audit log
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
    success: true
    message: "Registration successful"
    data   : ```
      {
        authToken: $authToken,
        user: $user
      }
      ```
  }

  guid = "vsZcl0M4A2W2s0uXkG9Y8cQPEUM"
}