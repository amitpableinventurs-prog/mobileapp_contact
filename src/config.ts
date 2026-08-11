// Live production backend at emplogin.com. Verified reachable: GET on
// /login returns HTTP 405 (Method Not Allowed) instead of a connection
// error, confirming the api.php routes are live at this path.
//
// NOTE: api.emplogin.com (the subdomain mentioned for APIs) does not
// currently resolve via DNS — see conversation. Once that subdomain is
// pointed at the server and its docroot serves the same Laravel `public/`
// folder as new_contacts, this can be switched to
// 'https://api.emplogin.com/api' instead.
export const API_BASE_URL = 'https://emplogin.com/new_contacts/public/api';
