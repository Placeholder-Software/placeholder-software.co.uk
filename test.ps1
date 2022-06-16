Clear-Host;
gulp clean
gulp default --base_path="//localhost:8080";
Set-Location dist;
http-server