<%@ Page Language="C#" %>
<%@ Import Namespace="System.Web.Security" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<script runat="server">
public void Login_OnClick(object sender, EventArgs args)
{
   if (FormsAuthentication.Authenticate(UsernameTextbox.Text, PasswordTextbox.Text))
      FormsAuthentication.RedirectFromLoginPage(UsernameTextbox.Text, NotPublicCheckBox.Checked);
   else
     Msg.Text = "Login failed. Please check your user name and password and try again.";
}
</script>
<html xmlns="http://www.w3.org/1999/xhtml" >
<head>
  <title>Login</title>
  <style>
  body {
  color: #333333;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 14px;
  background: #fff;
}


input[type='text']:focus, input[type="password"]:focus, input[type='email']:focus {
  color: #555555;
  border: 1px solid #555555;
  outline: none;
}
input[type='text'], input[type='password'], input[type='email']{
  margin-top: 3px;
  margin-bottom: 10px;
  width: 95%;
  height: 20px;
  padding: 6px 12px;
  font-size: 14px;
  color: #555555;
  border: 1px solid #cccccc;
  line-heigt: 1.428571429;
}
input[type="submit"] {
  margin-top:10px;
  width: auto;
  height: auto;
  display: inline-block;
  cursor: pointer;
  padding: 10px 25px;
  border: 0 solid #018dc4;
  font-size: 14px;
  color: rgba(255,255,255,0.9);
  background: #3498db;
  -webkit-transition: all 0.4s ease-in-out;
  transition: all 0.4s ease-in-out;
}
input[type="submit"]:hover {
  background-color: #2980b9;
  -webkit-transition: all 0.4s ease-in-out;
  transition: all 0.4s ease-in-out;
}
  </style>
</head>
<body>
<form id="form1" runat="server">
  <h3>Login</h3>
  <asp:Label id="Msg" ForeColor="maroon" runat="server" /><br />
  Username: <asp:Textbox id="UsernameTextbox" runat="server" /><br />
  Password: <asp:Textbox id="PasswordTextbox" runat="server" TextMode="Password" /><br />
  <asp:Button id="LoginButton" Text="Login" OnClick="Login_OnClick" runat="server" />
  <asp:CheckBox id="NotPublicCheckBox" runat="server" /> 
  Check here if this is <span style="text-decoration:underline">not</span> a public computer.
</form>
</body>
</html>