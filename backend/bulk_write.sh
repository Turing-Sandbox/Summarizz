#!/usr/bin/bash

: << 'END_COMMENT'

This script is currently used to create temporary files based on a 
pattern in the current directory and its subdirectories. However,
you can use this script to create any recurring files you see fit such
as repeating config files, or any other files that may be needed throughout 
the module directories.

In order to make this change, you will simply need to modify the following:

for dir in "$script_dir"/*module*/; do

to something more appropriate for the purpose of the script.

END_COMMENT

create_temp_file_in_subdirs() {
    local parent_dir="$1"
    local file_name="TEMP.txt"

    for subdir in "$parent_dir"/*/; do
        if [ -f "$subdir/$file_name" ]; then
            echo "Removing existing temp file in $subdir"
            rm "$subdir/$file_name"
        fi

        if [ -d "$subdir" ]; then
            echo "Creating temp file in $subdir"
            echo "This is a TEMP file, remove when necessary." > "$subdir/$file_name"
        fi
    done
}

script_dir=$(dirname "$0")

for dir in "$script_dir"/*module*/; do
    if [ -d "$dir" ]; then
        echo "Processing directory: $dir"
        create_temp_file_in_subdirs "$dir"
    fi
done

echo "Script has been executed successfully... Happy Coding 🎉"
