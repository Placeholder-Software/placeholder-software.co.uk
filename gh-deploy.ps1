gulp
git add dist -f
git commit -m "deploying"
git subtree push --prefix dist origin gh-pages
Remove-Item dist -Recurse
git commit -m "post deploying"

