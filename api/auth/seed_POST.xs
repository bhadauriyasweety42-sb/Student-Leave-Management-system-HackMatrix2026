// Run the seed function to initialize demo data
// Initialize demo data (Admin only)
query seed verb=POST {
  api_group = "Auth"
  auth = "user"

  input {
  }

  stack {
    function.run "rbac/check_role" {
      input = {user_id: $auth.id, required_role: "admin"}
    }
  
    function.run "utils/seed_data" as $res
  }

  response = {success: true, message: $res}
  guid = "hTFeF6pPqkW-NKISsUpSLBDqzxg"
}