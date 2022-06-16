gulp clean
gulp default --base_path="//dissonance.cloud"
Remove-Item docs -Recurse
Rename-Item dist docs
"dissonance.cloud" | Out-File -FilePath "docs/CNAME"