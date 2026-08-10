// Get own user profile (alternative to /auth/me)
query me verb=GET {
  api_group = "Users"
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
      error = "User not found"
    }
  }

  response = {success: true, data: $user}
  guid = "jJSue2q-91IKWJ4MhfOvfdklOZk"
}