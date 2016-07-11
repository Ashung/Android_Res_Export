

SKETCH_FILE=a.sketch
ASSETS_FOLDER=sketchres
FILENAME=test
CONTENT_IMAGE_ID=75A76CAC-ADC4-48D8-BDF9-4DBA2AAE57FF #63D0FEE4-BE2B-4120-ADF2-4BFF1B399746
PATCH_IMAGE_ID=3C4E9DA6-FB3B-4725-BD5A-3EAB22E64385

MDPI_CONTENT=${ASSETS_FOLDER}/${CONTENT_IMAGE_ID}.png
MDPI_PATCH=${ASSETS_FOLDER}/${PATCH_IMAGE_ID}.png
MDPI_PATCH_TOP=${ASSETS_FOLDER}/${PATCH_IMAGE_ID}_top.png
MDPI_PATCH_RIGHT=${ASSETS_FOLDER}/${PATCH_IMAGE_ID}_right.png
MDPI_PATCH_BOTTOM=${ASSETS_FOLDER}/${PATCH_IMAGE_ID}_bottom.png
MDPI_PATCH_LEFT=${ASSETS_FOLDER}/${PATCH_IMAGE_ID}_left.png

HDPI_CONTENT=${ASSETS_FOLDER}/${CONTENT_IMAGE_ID}@1x.png
XHDPI_CONTENT=${ASSETS_FOLDER}/${CONTENT_IMAGE_ID}@2x.png
XXHDPI_CONTENT=${ASSETS_FOLDER}/${CONTENT_IMAGE_ID}@3x.png
XXXHDPI_CONTENT=${ASSETS_FOLDER}/${CONTENT_IMAGE_ID}@4x.png

BG=${ASSETS_FOLDER}/${CONTENT_IMAGE_ID}_bg.png

MDPI_TO_HDPI=1.500001
MDPI_TO_XHDPI=2
MDPI_TO_XXHDPI=3
MDPI_TO_XXXHDPI=4

# Export content image
sketchtool export slices ${SKETCH_FILE} --use-id-for-name="yes" --item="${CONTENT_IMAGE_ID}" --scales="1, 1.5, 2, 3, 4" --group-contents-only="yes" --output="${ASSETS_FOLDER}"

# Export patch image
sketchtool export layers ${SKETCH_FILE} --use-id-for-name="yes" --item="${PATCH_IMAGE_ID}" --output="${ASSETS_FOLDER}"

# Origin content width & height
WIDTH=$(identify -format "%[fx:w]" ${MDPI_CONTENT})
HEIGHT=$(identify -format "%[fx:h]" ${MDPI_CONTENT})

# mkdir
mkdir -p ${ASSETS_FOLDER}/res/drawable-mdpi
mkdir -p ${ASSETS_FOLDER}/res/drawable-hdpi
mkdir -p ${ASSETS_FOLDER}/res/drawable-xhdpi
mkdir -p ${ASSETS_FOLDER}/res/drawable-xxhdpi
mkdir -p ${ASSETS_FOLDER}/res/drawable-xxxhdpi

# Create MDPI Nine-Patch
composite -gravity center ${MDPI_CONTENT} ${MDPI_PATCH} ${ASSETS_FOLDER}/res/drawable-mdpi/${FILENAME}.9.png

# Create MDPI patch lines
convert -crop ${WIDTH}x1+1+0 ${MDPI_PATCH} ${MDPI_PATCH_TOP}
convert -crop 1x${HEIGHT}+$((${WIDTH}+1))+1 ${MDPI_PATCH} ${MDPI_PATCH_RIGHT}
convert -crop ${WIDTH}x1+1+$((${HEIGHT}+1)) ${MDPI_PATCH} ${MDPI_PATCH_BOTTOM}
convert -crop 1x${HEIGHT}+0+1 ${MDPI_PATCH} ${MDPI_PATCH_LEFT}

createNinePatch () {
    NEW_WIDTH=$(printf "%.0f" `echo $1*${WIDTH}|bc`)
    NEW_HEIGHT=$(printf "%.0f" `echo $1*${HEIGHT}|bc`)

    # echo ${NEW_WIDTH} ${NEW_HEIGHT}

    # Create transparent background
    convert -size $((${NEW_WIDTH}+2))x$((${NEW_HEIGHT}+2)) xc:none ${BG}

    convert -resize ${NEW_WIDTH}x1! -filter point -interpolate Nearest ${MDPI_PATCH_TOP} - | composite -gravity North - ${BG} ${BG}
    convert -resize 1x${NEW_HEIGHT}! -filter point -interpolate Nearest ${MDPI_PATCH_RIGHT} - | composite -gravity East - ${BG} ${BG}
    convert -resize ${NEW_WIDTH}x1! -filter point -interpolate Nearest ${MDPI_PATCH_BOTTOM} - | composite -gravity South - ${BG} ${BG}
    convert -resize 1x${NEW_HEIGHT}! -filter point -interpolate Nearest ${MDPI_PATCH_LEFT} - | composite -gravity West - ${BG} ${BG}
    composite -gravity center $2 ${BG} ${ASSETS_FOLDER}/res/drawable-$3/${FILENAME}.9.png
}

createNinePatch ${MDPI_TO_HDPI} ${HDPI_CONTENT} hdpi
createNinePatch ${MDPI_TO_XHDPI} ${XHDPI_CONTENT} xhdpi
createNinePatch ${MDPI_TO_XXHDPI} ${XXHDPI_CONTENT} xxhdpi
createNinePatch ${MDPI_TO_XXXHDPI} ${XXXHDPI_CONTENT} xxxhdpi

# Clean temp images
#rm ${MDPI_CONTENT}
#rm ${MDPI_PATCH}
#rm ${MDPI_PATCH_TOP}
#rm ${MDPI_PATCH_RIGHT}
#rm ${MDPI_PATCH_BOTTOM}
#rm ${MDPI_PATCH_LEFT}
#rm ${HDPI_CONTENT}
#rm ${XHDPI_CONTENT}
#rm ${XXHDPI_CONTENT}
#rm ${XXXHDPI_CONTENT}
#rm ${BG}
