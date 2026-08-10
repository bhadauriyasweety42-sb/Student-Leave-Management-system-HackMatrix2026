// List own notifications
query list verb=GET {
  api_group = "Notifications"
  auth = "user"

  input {
    int page?=1
    int per_page?=20
  }

  stack {
    db.query notification {
      where = $db.notification.user_id == $auth.id
      sort = {created_at: "desc"}
      return = {
        type  : "list"
        paging: {
          page    : $input.page
          per_page: $input.per_page
          totals  : true
        }
      }
    } as $notifications
  }

  response = {success: true, data: $notifications}
  guid = "uyoaZ3mYaLGI48eVugGCchaQl-o"
}