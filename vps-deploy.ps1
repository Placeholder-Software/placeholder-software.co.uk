gulp default --base_path="//placeholder-software.co.uk"
bash -c "scp -rp dist martindevans@mumble.placeholder-software.co.uk:/var/www/placeholder-software.co.uk_new"
bash -c 'ssh martindevans@mumble.placeholder-software.co.uk "/var/www/update-placeholder-software.co.uk.sh"'