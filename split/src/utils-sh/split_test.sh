# help screen
#  split.js
#   split would split a roll.csv into roll_split.csv for block:product or 1:1 relationship
#   split would split a roll.csv into roll_split.csv for blocks:product or m:1 relationship and concatenates all blocks into the same file.
#   split would split a roll.csv into
#        roll_split_[start tag 0].csv, roll_split_[start tag last].csv 
#        for blocks:product or m:1 relationship and concatenates all blocks 
#        into the same file effectively turn this into bulb move
#   arguments:
#
#    --csvfilepath - linux based relative or absolute file path, not HTTP rest API
#    --start_tag - single Tag UID or comma seperate list of Tag UIDs i.e. tag0,tag1,tag2,tag3
#    --end_tag - singleTag UID or comma seperate list of Tag UIDs tag0,tag1,tag2,tag3  must match the same count as start_tags
#    --multipe_files - default is no, all blocks will into roll_split.csv, if specified, it will go into multiple files with roll_split_starttag[0n].csv
#    --parent_product - database ID
#
# test file for check split.js 
# 1:1 error cases
# split.js ./dev/null tag1 tag2 // no such file exists
# split.js ./tmp/abcdef.csv tag1 tag2 // no such file exists
# split.js /etc/hosts tag1 tag2 // access no permission
# split.js ./tmp/abcdef.csv tag1 // with only one tag
# split.js ./tmp/abcdef.csv tag1 tag2 // with one valid tag, but one invalid tag
# split.js ./tmp/abcdef.csv tag1 tag2 // with one invalid tag, and second valid tag
# split.js ./tmp/abcdef.csv tag1 tag2 // with one invalid tag, and second invalid tag
# split.js ./tmp/abcdef.csv tag1 tag2 // with two valid tags, but not product table id
# split.js ./tmp/abcdef.csv tag1 tag2 // with two valid tags, but invalid product table 
#
# 1:1
# split.js ./csv/pP011707033.csv first last 1231234BASDACAS0123 // complete roll
# split.js /Users/chan/thinfirm/operation/split/csv/pP011707033.csv 10th 11th 1231234BASDACAS0123 // side by side
# split.js ./csv/pP011707033.csv 100th 50th 1231234BASDACAS0123 // reverse, we proper it and output warn message
#
# m:1 error cases 
# split.js ./csv/pP011707033.csv first-last 1231234BASDACAS0123 // complete roll range
# split.js ./csv/pP011707033.csv first-last 50-55Th  1231234BASDACAS0123 // two range overlapping
# split.js ./csv/pP011707033.csv 0-10th 50-55Th 54th-70th  1231234BASDACAS0123 // three ranges, last two range overlapping
# split.js ./csv/pP011707033.csv 0-0th -50-55Th 54th-70th  1231234BASDACAS0123 // invalid range syntax
# split.js ./csv/pP011707033.csv 0-0th -50-55Th 54th-70th  1231234BASDACAS0123 multiple_files// go to roll_split_starttag0.csv, roll_split_starttag1.csv, roll_split_starttagn.csv
