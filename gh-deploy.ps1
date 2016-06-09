Try
{
    #Get the current branch, so we can switch back to it later
    $current_branch = git rev-parse --abbrev-ref HEAD
    
    #Switch to the deploy branch (check for error!)
    git checkout gh-deploy
    if ($?)
    {
        git merge -X theirs master
        gulp
        git add dist -f
        git commit -m "deploying..."
        git subtree push --prefix dist origin gh-pages
        Remove-Item dist -Recurse
        git commit -m "deployed"
    }
}
Finally
{
    git checkout $current_branch
}

