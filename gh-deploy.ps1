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
        $magic = git subtree split --prefix dist gh-pages
        git subtree push origin $magic:gh-pages --force
        Remove-Item dist -Recurse
    }
}
Finally
{
    git checkout $current_branch
}
