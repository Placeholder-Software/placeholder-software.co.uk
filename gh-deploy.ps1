Try
{
    $current_branch = git rev-parse --abbrev-ref HEAD
    $ckerr = git checkout gh-deploy
    if ($?)
    {
        git reset master --hard
        gulp
        git add dist -f
        git commit -m "deploying..."
        git subtree push --prefix dist origin gh-pages
        Remove-Item dist -Recurse
    }
}
Finally
{
    git checkout $current_branch
}
