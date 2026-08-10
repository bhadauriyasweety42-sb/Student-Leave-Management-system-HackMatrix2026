// List all employees (HR/Admin)
query list verb=GET {
  api_group = "Users"
  auth = "user"

  input {
    int page?=1
    int per_page?=20
    int? department_id
    text? role
    text? search
  }

  stack {
    // 1. RBAC
    function.run "rbac/check_role" {
      input = {user_id: $auth.id, required_role: "hr"}
    }
  
    // 2. Query
    db.query user {
      join = {
        department: {
          table: "department"
          type : "left"
          where: $db.user.department_id == $db.department.id
        }
      }
    
      where = ($db.user.department_id ==? $input.department_id) && ($db.user.role ==? $input.role) && (($db.user.full_name includes? $input.search) || ($db.user.email includes? $input.search) || ($db.user.employee_id includes? $input.search))
      eval = {department_name: $db.department.name}
      return = {
        type  : "list"
        paging: {
          page    : $input.page
          per_page: $input.per_page
          totals  : true
        }
      }
    } as $users
  }

  response = {success: true, data: $users}
  guid = "YLVwMUol7xK_5EEpB6nHM1bztLc"
}