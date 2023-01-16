echo "Building the auditor image ..."
cp ./docker/config.json ./docker/image-auditor/src/
docker build -t dai/auditor ./docker/image-auditor