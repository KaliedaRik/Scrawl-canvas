#!/bin/bash

cd ./source

for file in **/*.js; do
	out="../min/${file}"
	sed "/\/\/.*/d ; s/^[[:blank:]]*// ; s/[[:blank:]]*$// ; /^[[:blank:]]*$/d" $file > $out
	echo "${file} > ${out}"
done

sed "/\/\/.*/d ; s/^[[:blank:]]*// ; s/[[:blank:]]*$// ; /^[[:blank:]]*$/d" scrawl.js > ../min/scrawl.js

cd ..
