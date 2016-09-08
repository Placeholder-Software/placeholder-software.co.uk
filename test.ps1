cls;
rm -recurse dist;
rm -recurse .tmp;
gulp build --base_path="//localhost:8080";
cd dist;
http-server