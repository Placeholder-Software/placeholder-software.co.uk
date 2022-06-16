const argv = require('yargs').argv;
const fs = require('fs');
const path = require('path');

module.exports = {
    site_data: function() {

        var base_path = argv.base_path || "";
        console.log("Base path is: '" + base_path + "'");

        var pages = sitepages();
        return {
          base_path: base_path,
          discord_path: "https://placeholder-software.co.uk/discord",
          wetstuff_docs_path: "https://wetsurfacedecals.readthedocs.io/en/latest/",
          wetstuff_community_path: "https://placeholder-software.co.uk/wetstuff/community",

          admin_email: "admin@placeholder-software.co.uk",
          martin_email: "martin@placeholder-software.co.uk",
          tom_email: "tom@placeholder-software.co.uk",

          now: new Date().toISOString(),
          site: pages,
          all_pages: flatten(pages)
        }
    }
}

function flatten(hierarchy, into) {
    if (!into) {
        into = [];
    }

    for (var i in hierarchy.pages) {
        var value = hierarchy.pages[i];
        if (value.file) {
            into.push(value);
        }
    }

    for (var key in hierarchy) {
        if (key === "pages" || !hierarchy.hasOwnProperty(key)) {
            continue;
        }

        var value = hierarchy[key];
        if (value.directory) {
            into.push(value);
            flatten(value.children, into)
        }
    }

    return into;
}
  
function sitepages() {
    function getFilesRecursive(searchRoot, urlRoot, templateRoot) {
    var fileContents = fs.readdirSync(searchRoot);

    var files = { pages: [] };
    fileContents.forEach(function (fileName) {
        var filePath = searchRoot + '/' + fileName;
        var stats = fs.lstatSync(filePath);

        if (stats.isDirectory()) {
            files[fileName] = {
            file: false,
            directory: true,
            name: fileName,
            url: (urlRoot + '/' + fileName),
            children: getFilesRecursive(searchRoot + '/' + fileName, urlRoot + '/' + fileName, templateRoot + "/" + fileName)
            };
        } else {
            var name = path.parse(fileName).name;
            var ext = path.extname(fileName);
            var dir = path.basename(path.dirname(filePath));
            if (name != "index" && (ext == ".html" || ext == ".nunjucks" )) {

            //Attempt to parse a date out of the title
            var date = new Date();
            if (name.includes('-')) {
                var parts = name.split('-').slice(0, 3).map(function(a) { return parseInt(a); });
                if (parts.length == 3 && parts[0] && parts[1] && parts[2]) {
                date = new Date(parts[0], parts[1] - 1, parts[2])
                }
            }
            
            //Parse version out of title
            var version = null;
            if (dir == "releases") {
                var parts = name.split('.').slice(0, 3).map(a => parseInt(a));
                if (parts.length == 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
                version = {
                    major: parts[0],
                    minor: parts[1],
                    patch: parts[2],
                    name: parts[0] + "." + parts[1] + "." + parts[2]
                };
                }
            }

            var d = {
                file: true,
                directory: false,
                name: name,
                path: templateRoot + '/' + fileName,
                timestamp: date.getTime(),
                version: version,
                date: {
                day: date.getDate(),
                month: date.toLocaleString("en-gb", { month: "long" }),
                year: date.getFullYear(),
                iso: date.toISOString()
                },
                url: (urlRoot + '/' + fileName).replace("nunjucks", "html").replace("md", "html").replace("index.html", "")
            };
            
            if (version !== null) {
                d.version_major = version.major;
                d.version_minor = version.minor;
                d.version_patch = version.patch;
                d.has_version = true;
            } else {
                d.has_version = false;
            }
            
            files.pages.push(d);
            }
        }
    });
    
    files.pages.sort(function(a,b) {
        
        //Sort by version
        if (a.has_version && b.has_version) {
        var maj = a.version_major - b.version_major;
        if (maj !== 0) { return maj; }
        
        var min = a.version_minor - b.version_minor;
        if (min !== 0) { return min; }
        
        return a.version_patch - b.version_patch;
        }
        
        //No version sorting, so sort by date
        return a.timestamp - b.timestamp;
        
    });

    return files;
    }

    return getFilesRecursive('./app/pages', '', 'pages')
}