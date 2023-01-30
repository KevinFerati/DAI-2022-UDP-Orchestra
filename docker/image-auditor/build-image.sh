echo "Building the auditor image ..."
docker build -t dai/auditor -f ./docker/image-auditor/Dockerfile ./docker/image-auditor