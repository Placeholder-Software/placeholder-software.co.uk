Try
{
    $current_branch = git rev-parse --abbrev-ref HEAD
    git checkout gh-deploy
    gulp
    git add dist -f
    git commit -m "deploying..."
    git subtree push --prefix dist origin gh-pages
    Remove-Item dist
}
Finally
{
    git checkout $current_branch
}
