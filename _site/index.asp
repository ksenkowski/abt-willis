
<% @Language = "VBScript" %>
<% Option Explicit
Response.Buffer = True

Dim HostURL
Dim NewLocation
HostURL = Lcase(Request.ServerVariables("HTTP_HOST"))

Select Case HostURL ' Find which site to redirect to
	Case "www.abt-willis.com","abt-willis.com"
		NewLocation = "index.html"
	Case "www.willis-abt.com","willis-abt.com"
		NewLocation = "index.html"

End Select

 Response.Redirect NewLocation
   Response.Flush
   Response.End
%>



