// Get the current authenticated user profile
// Get current user college profile
query me verb=GET {
  api_group = "Auth"
  auth = "user"

  input {
  }

  stack {
    db.get user {
      field_name = "id"
      field_value = $auth.id
    } as $user
  
    precondition ($user != null) {
      error_type = "notfound"
      error = "User not found."
    }
  
    // Fetch related info
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
  }

  response = {
    success: true
    data   : ```
      {
        user: {
          id: $user.id,
          name: $user.name,
          email: $user.email,
          role: $user.role,
          roll_number: $user.roll_number,
          department: $dept_rec,
          branch: $branch_rec,
          section: $section_rec,
          profile_image: $user.profile_image,
          created_at: $user.created_at
        }
      }
      ```
  }

  guid = "PyKQnkpq_UO_IVModbPFeg_EitY"
}